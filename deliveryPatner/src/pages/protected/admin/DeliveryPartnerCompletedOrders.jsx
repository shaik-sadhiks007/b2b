import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCompletedOrdersByDeliveryPartnerAdminApi } from '../../../api/Api';
import { toast } from 'react-toastify';

const DeliveryPartnerCompletedOrders = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalPages: 0, total: 0 });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getCompletedOrdersByDeliveryPartnerAdminApi(id, { page: pagination.page, pageSize: pagination.pageSize });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to load completed orders');
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); /* eslint-disable-next-line */ }, [id, pagination.page, pagination.pageSize]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No completed orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.restaurantName}</p>
                  <p className="text-sm text-gray-500">Order #{order._id.substring(0,6)} • {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">DELIVERED</span>
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

export default DeliveryPartnerCompletedOrders;


