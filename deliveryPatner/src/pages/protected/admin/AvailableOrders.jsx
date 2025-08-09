import React, { useEffect, useMemo, useState } from 'react';
import { getAvailableOrdersByAdminApi, getDeliveryPartnerListApi, assignOrdersByAdminApi, getAllBusinessNamesApiForAdmin } from '../../../api/Api';
import { toast } from 'react-toastify';
import OrderFilters from '../../../components/OrderFilters';
import AssignPartnerModal from '../../../components/AssignPartnerModal';
import { TimeAgo } from '../../../components/TimeAgo';

const AvailableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalPages: 0, total: 0 });
  const [timeFilter, setTimeFilter] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [businessNames, setBusinessNames] = useState([]);
  const [businessNamesLoading, setBusinessNamesLoading] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [orderIdToAssign, setOrderIdToAssign] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAvailableOrdersByAdminApi({ 
        page: pagination.page, 
        pageSize: pagination.pageSize,
        ...(timeFilter && { timeFilter }),
        ...(businessFilter && { businessFilter })
      });
      const fetchedOrders = res.data.orders;
      setOrders(fetchedOrders);
      setPagination(res.data.pagination);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to load available orders');
      setLoading(false);
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const res = await getDeliveryPartnerListApi();
      setDeliveryPartners(res.data.deliveryPartners || []);
    } catch (e) {
      // non-blocking
    }
  };

  useEffect(() => { 
    fetchOrders(); 
    // eslint-disable-next-line 
  }, [pagination.page, pagination.pageSize, timeFilter, businessFilter]);

  useEffect(() => { 
    fetchDeliveryPartners();
    // Fetch business names via API similar to Orders.jsx
    (async () => {
      try {
        setBusinessNamesLoading(true);
        const res = await getAllBusinessNamesApiForAdmin();
        setBusinessNames(res.data.businessNames || []);
      } catch (e) {
        // silent fail for filters
      } finally {
        setBusinessNamesLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  const handleToggleOrder = (orderId) => {
    const next = new Set(selectedOrderIds);
    if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
    setSelectedOrderIds(next);
    setSelectAll(next.size === orders.length);
  };

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedOrderIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedOrderIds(new Set(orders.map(o => o._id)));
      setSelectAll(true);
    }
  };

  const handleAssignSelected = async () => {
    if (!selectedPartnerId) {
      toast.warning('Please select a delivery partner');
      return;
    }
    const ids = Array.from(selectedOrderIds);
    if (ids.length === 0) {
      toast.warning('Please select at least one order');
      return;
    }
    try {
      await assignOrdersByAdminApi({ orderIds: ids, deliveryPartnerId: selectedPartnerId });
      toast.success('Orders assigned successfully');
      setSelectedOrderIds(new Set());
      setSelectAll(false);
      fetchOrders();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to assign orders');
    }
  };

  const openAssignModal = (orderId) => {
    setOrderIdToAssign(orderId);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setOrderIdToAssign('');
  };

  const confirmAssignModal = async (partnerId) => {
    if (!orderIdToAssign || !partnerId) return;
    try {
      await assignOrdersByAdminApi({ orderId: orderIdToAssign, deliveryPartnerId: partnerId });
      toast.success(`Order ${orderIdToAssign.slice(-6)} assigned`);
      const next = new Set(selectedOrderIds);
      next.delete(orderIdToAssign);
      setSelectedOrderIds(next);
      closeAssignModal();
      fetchOrders();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to assign order');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Available Orders</h2>

      {/* Filters (reuse component like Orders.jsx) */}
      <OrderFilters
        timeFilter={timeFilter}
        businessFilter={businessFilter}
        businessNames={businessNames}
        businessNamesLoading={businessNamesLoading}
        onTimeFilterChange={setTimeFilter}
        onBusinessFilterChange={setBusinessFilter}
        onClearFilters={() => { setTimeFilter(''); setBusinessFilter(''); }}
      />

      {/* Bulk actions toolbar: always show Select All; show partner controls only when some selected */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={selectAll} onChange={handleToggleSelectAll} />
          Select All ({orders.length})
        </label>
        {selectedOrderIds.size > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-xs"
            >
              <option value="">Select partner</option>
              {deliveryPartners.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.mobileNumber ? `(${p.mobileNumber})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignSelected}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Assign Selected ({selectedOrderIds.size})
            </button>
          </div>
        )}
      </div>
      {orders.length === 0 ? (
        <p className="text-gray-500">No available orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.has(order._id)}
                    onChange={() => handleToggleOrder(order._id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{order.restaurantName}</p>
                    <p className="text-sm text-gray-500">Order #{order._id.substring(0,6)} • <TimeAgo timestamp={order.createdAt} /></p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">UNASSIGNED</span>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {order.items?.map((it, idx) => (
                  <span key={idx}>{it.name} × {it.quantity}{idx < order.items.length-1 ? ', ' : ''}</span>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <div className="mb-1">
                  <span className="font-medium">Customer:</span> {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}
                </div>
                <div>
                  <span className="font-medium">Delivery Address:</span>{' '}
                  {order.customerAddress && (
                    <span>
                      {order.customerAddress.street}, {order.customerAddress.city}, {order.customerAddress.state} {order.customerAddress.pincode}, {order.customerAddress.country}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <span className="font-medium">Payment:</span> {order.paymentMethod}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={() => openAssignModal(order._id)}
                  className="px-3 py-1.5 rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AssignPartnerModal
        open={isAssignModalOpen}
        onClose={closeAssignModal}
        onConfirm={confirmAssignModal}
        deliveryPartners={deliveryPartners}
      />
    </div>
  );
};

export default AvailableOrders;


