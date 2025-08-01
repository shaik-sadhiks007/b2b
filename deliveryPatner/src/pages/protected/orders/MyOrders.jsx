import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryPartnerOrders, updateDeliveryPartnerOrderStatus, fetchDeliveryPartnerBusinessNames } from '../../../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import Pagination from '../../../components/Pagination';
import OrderFilters from '../../../components/OrderFilters';
import { CheckSquare, Square, Check } from 'lucide-react';

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
  const { orders, loading, error, pagination, deliveryPartnerBusinessNames, deliveryPartnerBusinessNamesLoading } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [timeFilter, setTimeFilter] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  console.log(user,'my orders user');

  useEffect(() => {
    dispatch(fetchDeliveryPartnerOrders({ 
      page: currentPage, 
      pageSize, 
      timeFilter, 
      businessFilter 
    }));

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
        dispatch(fetchDeliveryPartnerOrders({ 
          page: currentPage, 
          pageSize, 
          timeFilter, 
          businessFilter 
        }));
      }
    });

    return () => {
      socket.off('orderStatusUpdate');
    };
  }, [dispatch, currentPage, pageSize, timeFilter, businessFilter]);

  // Reset selections when orders change
  useEffect(() => {
    setSelectedOrders(new Set());
    setSelectAll(false);
  }, [orders]);

  // Fetch business names on component mount
  useEffect(() => {
    dispatch(fetchDeliveryPartnerBusinessNames());
  }, [dispatch]);

  const handleStatusUpdate = (orderId) => {
    dispatch(updateDeliveryPartnerOrderStatus({ orderId, status: 'ORDER_DELIVERED' }));
  };

  const handleMultipleStatusUpdate = () => {
    if (selectedOrders.size === 0) {
      toast.warning('Please select at least one order to mark as completed');
      return;
    }

    selectedOrders.forEach(orderId => {
      dispatch(updateDeliveryPartnerOrderStatus({ orderId, status: 'ORDER_DELIVERED' }));
    });

    toast.success(`Marked ${selectedOrders.size} order(s) as completed`);
    setSelectedOrders(new Set());
    setSelectAll(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setCurrentPage(1);
  };

  const handleBusinessFilterChange = (value) => {
    setBusinessFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setTimeFilter('');
    setBusinessFilter('');
    setCurrentPage(1);
  };

  const handleSelectOrder = (orderId) => {
    const newSelectedOrders = new Set(selectedOrders);
    if (newSelectedOrders.has(orderId)) {
      newSelectedOrders.delete(orderId);
    } else {
      newSelectedOrders.add(orderId);
    }
    setSelectedOrders(newSelectedOrders);
    setSelectAll(newSelectedOrders.size === orders.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      // Only select orders that are ready for completion (OUT_FOR_DELIVERY)
      const readyOrders = orders.filter(order => isOrderReadyForCompletion(order));
      setSelectedOrders(new Set(readyOrders.map(order => order._id)));
    }
    setSelectAll(!selectAll);
  };

  const isOrderCompleted = (order) => {
    return order.status === 'ORDER_DELIVERED';
  };

  const isOrderReadyForCompletion = (order) => {
    return order.status === 'OUT_FOR_DELIVERY';
  };

  console.log(orders,'my orders');
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Delivery Orders</h1>
      
      {/* Filters */}
      <OrderFilters
        timeFilter={timeFilter}
        businessFilter={businessFilter}
        businessNames={deliveryPartnerBusinessNames}
        businessNamesLoading={deliveryPartnerBusinessNamesLoading}
        onTimeFilterChange={handleTimeFilterChange}
        onBusinessFilterChange={handleBusinessFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Select All</span>
              </label>
              {selectedOrders.size > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedOrders.size} order(s) selected
                </span>
              )}
            </div>
            {selectedOrders.size > 0 && (
              <button
                onClick={handleMultipleStatusUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark Selected as Completed
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <div>Loading orders...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && orders.length === 0 && <div>No orders assigned.</div>}
      
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order._id)}
                    onChange={() => handleSelectOrder(order._id)}
                    disabled={!isOrderReadyForCompletion(order)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {isOrderReadyForCompletion(order) ? 'Select' : 'Not Available'}
                  </span>
                </label>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h2>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isOrderCompleted(order) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <span className="font-medium">Business:</span> {order.restaurantName}
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
            
            {/* Individual status update button */}
            <button
              className={`mt-4 px-4 py-2 rounded transition-colors ${
                isOrderCompleted(order)
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : isOrderReadyForCompletion(order)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => handleStatusUpdate(order._id)}
              disabled={!isOrderReadyForCompletion(order)}
            >
              {isOrderCompleted(order) ? 'Completed' : 'Mark as Completed'}
            </button>
          </div>
        ))}
      </div>
      
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pageSize}
        totalItems={pagination.total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default MyOrders;