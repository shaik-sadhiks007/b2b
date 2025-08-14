import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';
import { useCart } from '../context/CartContext';
import io from 'socket.io-client';
import { HotelContext } from '../contextApi/HotelContextProvider';

// Initialize socket 
const socket = io(API_URL, { withCredentials: true });

// Load Razorpay 
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-js')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'razorpay-js';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(s);
  });
}

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useContext(HotelContext);


  const data = state?.checkout;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  useEffect(() => {
    if (!user || !data) {
      navigate('/checkout', { replace: true });
    }
  }, [data, user, navigate]);

  if (!data) return null;

  const { orderData, calculatedCharges } = data;

  // Amounts
  const subtotal = calculatedCharges?.subtotalAmount ?? orderData.totalAmount;
  const delivery = calculatedCharges?.deliveryCharge ?? 0;
  const gstPct = calculatedCharges?.gstPercentage ?? 0;
  const gstAmt = calculatedCharges?.gstAmount ?? 0;
  const total = calculatedCharges?.totalAmount ?? orderData.totalAmount;
  const totalPaise = useMemo(() => Math.round(Number(total) * 100), [total]);

  //  COD flow
  const placeOrderCOD = async () => {
    try {
      setIsProcessing(true);
      const res = await axios.post(
        `${API_URL}/api/orders/place-order`,
        {
          ...orderData,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
        },
        { withCredentials: true }
      );

      if (res?.data?.order) {
        socket.emit('newOrder', res.data.order);
      }

      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/ordersuccess/${res.data.order._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to place order.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ONLINE flow with Razorpay
  const handleOnlinePayment = async () => {
    try {
      setIsProcessing(true);
      await loadRazorpayScript();

      // 1) Create Razorpay order 
      const { data: created } = await axios.post(
        `${API_URL}/api/payments/order`,
        {
          amount: totalPaise, 
          currency: 'INR',
          notes: {
            restaurantName: orderData.restaurantName,
            orderType: orderData.orderType,
          },
          
          checkoutSnapshot: {
            ...orderData,
            calculatedCharges,
            user: user?._id,
          },
          userId: user?._id,
        },
        { withCredentials: true }
      );

      const { key, order } = created;

      // 2) Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: orderData.restaurantName || 'Your Brand',
        description: 'Order Payment',
        notes: order.notes || {},
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        handler: async (rsp) => {
          // 3) Verify on server; server will create the app Order and return its id
          try {
            const { data: verify } = await axios.post(
              `${API_URL}/api/payments/verify`,
              {
                razorpay_order_id: rsp.razorpay_order_id,
                razorpay_payment_id: rsp.razorpay_payment_id,
                razorpay_signature: rsp.razorpay_signature,
              },
              { withCredentials: true }
            );

            if (!verify.verified) {
              toast.error('Payment verification failed');
              return;
            }

            toast.success('Payment successful!');
            await clearCart();

            if (verify.appOrderId) {
              navigate(`/ordersuccess/${verify.appOrderId}`);
            } else {
              // Fallback: webhook may still create the order, show orders list
              navigate('/orders');
            }
          } catch {
            toast.error('Verification error');
          }
        },
        modal: {
          ondismiss: () => toast.info('Payment cancelled'),
        },
        theme: { color: '#0ea5e9' },
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      toast.error('Unable to start online payment');
    } finally {
      setIsProcessing(false);
    }
  };

  //  UPI Payment Link (Razorpay-hosted page) 

  const handleUpiPaymentLink = async () => {
    try {
      setIsGeneratingLink(true);

      const { data: link } = await axios.post(
        `${API_URL}/api/payments/payment-link`,
        {
          amount: totalPaise, // paise
          customer: {
            name: user?.name || 'Customer',
            email: user?.email || undefined,
            contact: user?.phone || undefined,
          },
          description: 'Order Payment',

          checkoutSnapshot: {
            ...orderData,
            calculatedCharges,
            user: user?._id,
          },
        },
        { withCredentials: true }
      );

      if (link?.short_url) {
        
        toast.info('Redirecting to UPI payment page…');
        // Redirect to Razorpay-hosted payment link
        window.location.href = link.short_url;

      } else {
        toast.error('Failed to create payment link');
        setIsGeneratingLink(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('UPI payment link error');
      setIsGeneratingLink(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="flex justify-between">
          <span>Items total</span>
          <span>₹{Number(subtotal).toFixed(2)}</span>
        </div>
        {delivery > 0 && (
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>₹{Number(delivery).toFixed(2)}</span>
          </div>
        )}
        {typeof gstAmt === 'number' && gstAmt > 0 && (
          <div className="flex justify-between">
            <span>GST ({gstPct}%)</span>
            <span>₹{Number(gstAmt).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-3 mt-3 text-lg font-semibold">
          <span>Total</span>
          <span>₹{Number(total).toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-3">
        {/* Razorpay Checkout (all methods incl. UPI) */}
        <button
          onClick={handleOnlinePayment}
          disabled={isProcessing || isGeneratingLink}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {isProcessing ? 'Starting…' : 'Pay Now (Online - Razorpay Checkout)'}
        </button>

        {/* UPI Payment Link (Razorpay-hosted link page) */}
        <button
          onClick={handleUpiPaymentLink}
          disabled={isProcessing || isGeneratingLink}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          {isGeneratingLink ? 'Generating UPI Link…' : 'Pay via UPI Link'}
        </button>

        {/* COD */}
        <button
          onClick={placeOrderCOD}
          disabled={isProcessing || isGeneratingLink}
          className="w-full px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
        >
          Cash on Delivery
        </button>

        <p className="text-xs text-gray-500 pt-2">
          • Razorpay Checkout securely handles card/UPI/netbanking details. We never store sensitive card data.
          <br />
          • UPI Link opens a Razorpay-hosted page; once paid, our system creates your order automatically (via webhook).
        </p>
      </div>
    </div>
  );
}
