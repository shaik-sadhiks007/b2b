import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrdersByDeliveryPartnerAdminApi, updateOrderStatusByAdminForDPApi } from '../../../api/Api';
import { toast } from 'react-toastify';

const DeliveryPartnerOrders = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalPages: 0, total: 0 });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrdersByDeliveryPartnerAdminApi(id, { page: pagination.page, pageSize: pagination.pageSize });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); /* eslint-disable-next-line */ }, [id, pagination.page, pagination.pageSize]);

  const updateStatus = async (orderId, status) => {
    try {
      await updateOrderStatusByAdminForDPApi(orderId, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No active orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.restaurantName}</p>
                  <p className="text-sm text-gray-500">Order #{order._id.substring(0,6)} • {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-2 py-1 border rounded"
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                  >
                    <option value="ORDER_DELIVERY_READY">DELIVERY READY</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="ORDER_DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {order.items?.map((it, idx) => (
                  <span key={idx}>{it.name} × {it.quantity}{idx < order.items.length-1 ? ', ' : ''}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerOrders;


