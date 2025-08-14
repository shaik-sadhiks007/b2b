const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');

//  Razorpay lazy init 
let _rzp = null;
function getRazorpay() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (_rzp) return _rzp;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const e = new Error('RAZORPAY_KEYS_MISSING');
    e.code = 'RAZORPAY_KEYS_MISSING';
    throw e;
  }
  _rzp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  return _rzp;
}

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const toPaise = (rupeesLike) => Math.trunc(toNum(rupeesLike));

// Build an Order document from the snapshot we saved at payment-init time
function mapSnapshotToOrderDoc(snapshot = {}, payment = {}) {
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];

  // Subtotal with support for line-fixed-price offers
  const computedSubtotal = items.reduce((sum, it) => {
    const qty = toNum(it.quantity, 1);
    const unitOrLine = toNum(it.totalPrice, 0);
    const isFixed = !!it.lineIsFixedPrice; 
    return sum + (isFixed ? unitOrLine : unitOrLine * qty);
  }, 0);


  const subtotalAmount =
    toNum(snapshot.subtotalAmount,
      toNum(snapshot?.calculatedCharges?.subtotalAmount, computedSubtotal));

  const deliveryCharge =
    toNum(snapshot.deliveryCharge,
      toNum(snapshot?.calculatedCharges?.deliveryCharge, 0));

  const gstAmount =
    toNum(snapshot.gstAmount,
      toNum(snapshot?.calculatedCharges?.gstAmount, 0));

  const gstPercentage =
    toNum(snapshot.gstPercentage,
      toNum(snapshot?.calculatedCharges?.gstPercentage, 5));

  const totalAmount =
    toNum(snapshot.totalAmount,
      toNum(snapshot?.calculatedCharges?.totalAmount, subtotalAmount + deliveryCharge + gstAmount));

  
  const restaurantId =
    snapshot.restaurantId && typeof snapshot.restaurantId === 'object'
      ? snapshot.restaurantId._id
      : snapshot.restaurantId;

  const mappedItems = items.map((it) => ({
    itemId: it.itemId || it._id,
    name: it.name,
    quantity: toNum(it.quantity, 1),
    totalPrice: toNum(it.totalPrice, 0),
    photos: Array.isArray(it.photos) ? it.photos : [],
    
    foodType: it.foodType || (it.isVeg ? 'veg' : 'non-veg') || 'veg',
  }));

  const customerAddress =
    snapshot.addressId || snapshot.customerAddress || undefined;

  // Ensure orderType is exactly 'pickup' or 'delivery' 
  const orderType =
    (snapshot.orderType === 'pickup' || snapshot.orderType === 'delivery')
      ? snapshot.orderType
      : 'delivery';

  return {
    user: snapshot.user || snapshot.userId || payment.userId, 
    customerName: snapshot.customerName || 'Customer',
    customerPhone: toNum(snapshot.customerPhone, 0),

    items: mappedItems,

    customerAddress, 

    subtotalAmount,
    deliveryCharge,
    gstAmount,
    gstPercentage,
    totalAmount,

    paymentMethod: 'ONLINE',       
    paymentStatus: 'COMPLETED',    
    status: 'ORDER_PLACED',        

    restaurantId,
    restaurantName: snapshot.restaurantName,
    orderType,

    deliveryTime: toNum(snapshot.deliveryTime, 0),  
  };
}

// CONTROLLERS 

// POST /api/payments/order 
exports.createOrder = async (req, res) => {
  try {
    const rzp = getRazorpay();

    const {
      amount,                      
      currency = 'INR',
      receipt,
      notes = {},
      transfers = [],              
      checkoutSnapshot = {},       
      userId,
      storeIds = [],
    } = req.body || {};

    const paise = toPaise(amount);
    if (!paise || paise < 100) {
      return res.status(400).json({ error: 'Amount must be in paise and >= 100' });
    }

    // Create a Razorpay Order (can include transfers for Route)
    const order = await rzp.orders.create({
      amount: paise,
      currency,
      receipt,
      notes,
      ...(transfers.length ? { transfers } : {}),
    });

    // Persist a Payment row for idempotency & later webhook enrichment
    const paymentDoc = await Payment.create({
      userId: userId || req.user?._id || null,
      storeIds,
      amount: order.amount,                 
      currency: order.currency,
      receipt: order.receipt || order.id,   
      razorpay_order_id: order.id,
      status: 'created',
      transfers,
      checkoutSnapshot,
      notes,
    });

    return res.json({
      key: process.env.RAZORPAY_KEY_ID,     
      order,
      paymentId: paymentDoc._id,
    });
  } catch (err) {
    if (err.code === 'RAZORPAY_KEYS_MISSING') {
      return res.status(503).json({ onlinePayments: false, reason: 'Razorpay keys not configured' });
    }
    console.error('createOrder error:', err);
    return res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

// POST /api/payments/payment-link  
exports.createPaymentLink = async (req, res) => {
  try {
    const rzp = getRazorpay();

    const {
      amount,                      
      customer = {},               
      description = 'Order Payment',
      notes = {},
      checkoutSnapshot = {},
      userId,
      storeIds = [],
    } = req.body || {};

    // Response: { id, short_url, status }
    const paise = toPaise(amount);
    if (!paise || paise < 100) {
      return res.status(400).json({ error: 'Amount must be in paise and >= 100' });
    }
    if (!customer?.contact && !customer?.email) {
      return res.status(400).json({ error: 'Provide customer.contact (phone) or email for notifications' });
    }

    const pl = await rzp.paymentLink.create({
      amount: paise,
      currency: 'INR',
      description,
      customer,
      notify: { sms: !!customer?.contact, email: !!customer?.email },
      reminder_enable: true,
      notes,
      // Optional:
      // callback_url: 'https://your-frontend/orders',
      // callback_method: 'get',
    });

    await Payment.create({
      userId: userId || req.user?._id || null,
      storeIds,
      amount: pl.amount,            
      currency: 'INR',
      receipt: pl.id,                  
      status: 'created',
      paymentLinkId: pl.id,
      paymentLinkStatus: pl.status,
      checkoutSnapshot,
      notes,
    });

    return res.json({ id: pl.id, short_url: pl.short_url, status: pl.status });
  } catch (err) {
    if (err.code === 'RAZORPAY_KEYS_MISSING') {
      return res.status(503).json({ onlinePayments: false, reason: 'Razorpay keys not configured' });
    }
    console.error('payment-link error:', err);
    return res.status(500).json({ error: 'Failed to create payment link' });
  }
};

// POST /api/payments/verify  
exports.verify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Missing fields' });
    }

    // Compute server-side signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expected = hmac.digest('hex');

    const verified = expected === razorpay_signature;
    let appOrderId = null;

    if (verified) {
      const payment = await Payment.findOneAndUpdate(
        { razorpay_order_id },
        {
          $set: {
            status: 'paid',
            razorpay_payment_id,
            razorpay_signature,
          },
        },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ verified: false, error: 'Payment record not found' });
      }

      if (payment.appOrderId) {
        appOrderId = payment.appOrderId; 
      } else {
        const orderDoc = await Order.create(
          mapSnapshotToOrderDoc(payment.checkoutSnapshot, payment)
        );
        payment.appOrderId = orderDoc._id;
        await payment.save();
        appOrderId = orderDoc._id;

        const io = req.app?.get?.('io');
        if (io) io.emit('newOrder', orderDoc);
      }
    }

    return res.json({ verified, appOrderId });
  } catch (err) {
    console.error('verify error:', err);
    return res.status(500).json({ verified: false });
  }
};

// POST /api/payments/webhook  
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const raw = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(raw)
      .digest('hex');

    if (expected !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const evt = JSON.parse(raw);
    const event = evt.event;

    // Checkout success 
    if (event === 'payment.captured' || event === 'order.paid') {
      const pay = evt?.payload?.payment?.entity;
      const orderId = pay?.order_id || evt?.payload?.order?.entity?.id;

      if (orderId) {
        const payment = await Payment.findOneAndUpdate(
          { razorpay_order_id: orderId },
          {
            $set: {
              status: 'paid',
              ...(pay && {
                razorpay_payment_id: pay.id,
                method: pay.method,
                email: pay.email,
                contact: pay.contact,
                vpa: pay.vpa,
                card: pay.card
                  ? {
                      network: pay.card.network,
                      last4: pay.card.last4,
                      type: pay.card.type,
                      issuer: pay.card.issuer,
                    }
                  : undefined,
              }),
            },
          },
          { new: true }
        );

        if (payment && !payment.appOrderId) {
          const orderDoc = await Order.create(
            mapSnapshotToOrderDoc(payment.checkoutSnapshot, payment)
          );
          payment.appOrderId = orderDoc._id;
          await payment.save();

          const io = req.app?.get?.('io');
          if (io) io.emit('newOrder', orderDoc);
        }
      }
    }

    //  UPI Payment Link paid 
    if (event === 'payment_link.paid') {
      const link = evt?.payload?.payment_link?.entity;
      if (link?.id) {
        const payment = await Payment.findOneAndUpdate(
          { paymentLinkId: link.id },
          {
            $set: {
              status: 'paid',
              paymentLinkStatus: link.status,
            },
          },
          { new: true }
        );

        if (payment && !payment.appOrderId) {
          const orderDoc = await Order.create(
            mapSnapshotToOrderDoc(payment.checkoutSnapshot, payment)
          );
          payment.appOrderId = orderDoc._id;
          await payment.save();

          const io = req.app?.get?.('io');
          if (io) io.emit('newOrder', orderDoc);
        }

        // OPTIONAL (Route + Payment Link): create post-payment transfers here using payment_id
        // const paymentId = (link.payments && link.payments[0]) || null;
        // if (paymentId) {
        //   const rzp = getRazorpay();
        //   await rzp.payments.transfer(paymentId, {
        //     transfers: payment.transfers || []
        //   });
        // }
      }
    }

    // ---- Failure ----
    if (event === 'payment.failed') {
      const pay = evt?.payload?.payment?.entity;
      if (pay?.order_id) {
        await Payment.findOneAndUpdate(
          { razorpay_order_id: pay.order_id },
          { $set: { status: 'failed', razorpay_payment_id: pay.id } }
        );
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('webhook error:', err);
    return res.status(500).send('Webhook error');
  }
};
