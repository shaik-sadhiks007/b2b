import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryPartnerOrders, updateDeliveryPartnerOrderStatus } from '../../../redux/slices/orderSlice';
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

function MyOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);

  console.log(user,'my orders user');

  useEffect(() => {
    dispatch(fetchDeliveryPartnerOrders());

    // Listen for order status updates
    socket.on('orderStatusUpdate', (updatedOrder) => {
      console.log('Order status update received in MyOrders:', updatedOrder);
      
      // Check if this order belongs to the current delivery partner
      if (updatedOrder.deliveryPartnerId === user?._id) {
        console.log('Updating order for current delivery partner');
        
        // Show toast notification for OUT_FOR_DELIVERY status
        if (updatedOrder.status === 'OUT_FOR_DELIVERY') {
          toast.info(`Order #${updatedOrder._id.slice(-6)} is now out for delivery!`);
        }
        
        // Refresh orders to get updated status
        dispatch(fetchDeliveryPartnerOrders());
      }
    });

    return () => {
      socket.off('orderStatusUpdate');
    };
  }, [dispatch]);

  const handleStatusUpdate = (orderId) => {
    dispatch(updateDeliveryPartnerOrderStatus({ orderId, status: 'ORDER_DELIVERED' }));
  };

  console.log(orders,'my orders');
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Delivery Orders</h1>
      {loading && <div>Loading orders...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && orders.length === 0 && <div>No orders assigned.</div>}
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h2>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
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
              <span className="font-medium">Address:</span> {order.customerAddress && order.customerAddress.street}
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
            {/* Status update button */}
            <button
              className={`mt-4 px-4 py-2 rounded ${
                order.status === 'ORDER_DELIVERY_READY'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={() => handleStatusUpdate(order._id)}
              disabled={order.status.toLowerCase() == 'order_delivery_ready'}
            >
              Mark as Completed
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;