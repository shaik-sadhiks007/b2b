import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryPartnerOrders, updateDeliveryPartnerOrderStatus } from '../../../redux/slices/orderSlice';

function MyOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchDeliveryPartnerOrders());
  }, [dispatch]);

  const handleStatusUpdate = (orderId) => {
    dispatch(updateDeliveryPartnerOrderStatus({ orderId, status: 'ORDER_DELIVERED' }));
  };

  return (
    <div className="container mx-auto py-8">
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
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleStatusUpdate(order._id)}
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