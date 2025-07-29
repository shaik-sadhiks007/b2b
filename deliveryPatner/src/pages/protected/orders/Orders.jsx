import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableDeliveryOrders, acceptDeliveryOrder } from '../../../redux/slices/orderSlice';
import ErrorMessage from '../../../components/ErrorMessage';
import { TimeAgo } from '../../../components/TimeAgo';
import appImages from '../../../constants/appImages';
import Lottie from 'lottie-react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

// Initialize socket connection
const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

// Add connection logging
socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
});

function Orders() {
  const dispatch = useDispatch();
  const { availableOrders, availableError, availableLoading } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchAvailableDeliveryOrders());

    // Listen for delivery ready orders
    socket.on('deliveryReadyOrder', (newOrder) => {
      console.log('🚚 New delivery ready order received:', newOrder);
      
      // Show toast notification
      toast.info(`New delivery order available! Order #${newOrder._id.slice(-6)}`);

      // Refresh available orders
      dispatch(fetchAvailableDeliveryOrders());
    });

    return () => {
      socket.off('deliveryReadyOrder');
    };
  }, [dispatch]);

  const handleAcceptOrder = (orderId) => {
    dispatch(acceptDeliveryOrder(orderId));
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Available Orders to Accept</h1>
      {availableLoading && (
        <div className="flex flex-col items-center justify-center">
          <Lottie animationData={appImages.deliveryAnimation} style={{ width: 300, height: 300 }} />
          <div>Loading available orders...</div>
        </div>
      )}
      <ErrorMessage error={availableError} />
      {!availableLoading && availableOrders.length === 0 && !availableError && <div>No available orders to accept.</div>}
      {!availableLoading && availableOrders.length > 0 && (<div className="space-y-6 mb-10">
        {availableOrders.map(order => (
          <div key={order._id} className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h2>
                <p className="text-sm text-gray-500"><TimeAgo timestamp={order.createdAt} /></p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-medium">Restaurant:</span> {order.restaurantName}
            </div>
            <div className="mb-2">
              <span className="font-medium">Customer:</span> {order.customerName} ({order.customerPhone})
            </div>
            <div className="mb-2">
              <span className="font-medium">Address:</span> {order.customerAddress && (
                <span>
                  {order.customerAddress.street}, {order.customerAddress.city}, {order.customerAddress.state} {order.customerAddress.pincode}, {order.customerAddress.country}
                </span>
              )}
            </div>
            <div className="mb-2">
              <span className="font-medium">Total:</span> ₹{order.totalAmount}
            </div>
            <div className="mb-2">
              <span className="font-medium">Items:</span>
              <ul className="list-disc ml-6">
                {order.items.map((item, idx) => (
                  <li key={idx}>{item.quantity} x {item.name}</li>
                ))}
              </ul>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleAcceptOrder(order._id)}
            >
              Accept Order
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default Orders;