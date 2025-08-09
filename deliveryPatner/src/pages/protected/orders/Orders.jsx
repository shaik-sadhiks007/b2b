import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableDeliveryOrders, acceptDeliveryOrder, acceptMultipleDeliveryOrders, fetchBusinessNames } from '../../../redux/slices/orderSlice';
import ErrorMessage from '../../../components/ErrorMessage';
import { TimeAgo } from '../../../components/TimeAgo';
import appImages from '../../../constants/appImages';
import Lottie from 'lottie-react';
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

function Orders() {
  const dispatch = useDispatch();
  const { 
    availableOrders, 
    availableError, 
    availableLoading, 
    availablePagination,
    businessNames,
    businessNamesLoading,
    businessNamesError
  } = useSelector(state => state.orders);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [timeFilter, setTimeFilter] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // Fetch business names on component mount
    dispatch(fetchBusinessNames());
  }, [dispatch]);

  useEffect(() => {
    const params = { 
      page: currentPage, 
      pageSize,
      ...(timeFilter && { timeFilter }),
      ...(businessFilter && { businessFilter })
    };
    dispatch(fetchAvailableDeliveryOrders(params));

    // Listen for delivery ready orders
    socket.on('deliveryReadyOrder', (newOrder) => {
      console.log('🚚 New delivery ready order received:', newOrder);
      
      // Show toast notification
      toast.info(`New delivery order available! Order #${newOrder._id.slice(-6)}`);

      // Refresh available orders
      dispatch(fetchAvailableDeliveryOrders(params));
    });

    return () => {
      socket.off('deliveryReadyOrder');
    };
  }, [dispatch, currentPage, pageSize, timeFilter, businessFilter]);

  // Reset selected orders when orders change
  useEffect(() => {
    setSelectedOrders(new Set());
    setSelectAll(false);
  }, [availableOrders]);

  const handleAcceptOrder = (orderId) => {
    dispatch(acceptDeliveryOrder(orderId)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Order accepted successfully!');
      } else {
        toast.error('Failed to accept order');
      }
    });
  };

  const handleAcceptMultipleOrders = () => {
    if (selectedOrders.size === 0) {
      toast.warning('Please select at least one order to accept');
      return;
    }

    const orderIds = Array.from(selectedOrders);
    dispatch(acceptMultipleDeliveryOrders(orderIds)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Successfully accepted ${orderIds.length} orders!`);
        setSelectedOrders(new Set());
        setSelectAll(false);
      } else {
        toast.error('Failed to accept orders');
      }
    });
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
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setSelectAll(newSelected.size === availableOrders.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
      setSelectAll(false);
    } else {
      const allOrderIds = availableOrders.map(order => order._id);
      setSelectedOrders(new Set(allOrderIds));
      setSelectAll(true);
    }
  };

  const selectedCount = selectedOrders.size;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Available Orders to Accept</h1>
      
      {/* Filters */}
      <OrderFilters
        timeFilter={timeFilter}
        businessFilter={businessFilter}
        businessNames={businessNames}
        businessNamesLoading={businessNamesLoading}
        onTimeFilterChange={handleTimeFilterChange}
        onBusinessFilterChange={handleBusinessFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Error for business names */}
      {businessNamesError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Failed to load business names: {businessNamesError}
        </div>
      )}

      {/* Bulk Actions */}
      {availableOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="sr-only"
                />
                {selectAll ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  Select All ({availableOrders.length})
                </span>
              </label>
              {selectedCount > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  {selectedCount} order(s) selected
                </span>
              )}
            </div>
            {selectedCount > 0 && (
              <button
                onClick={handleAcceptMultipleOrders}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Accept Selected ({selectedCount})
              </button>
            )}
          </div>
        </div>
      )}

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
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="flex-shrink-0 mt-1">
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order._id)}
                    onChange={() => handleSelectOrder(order._id)}
                    className="sr-only"
                  />
                  {selectedOrders.has(order._id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </label>
              </div>

              {/* Order Content */}
              <div className="flex-1">
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
                  <span className="font-medium">Business :</span> {order.restaurantName}
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
                  <span className="font-medium">Payment:</span> {order.paymentMethod}
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
            </div>
          </div>
        ))}
      </div>
      )}
      <Pagination
        currentPage={availablePagination.page}
        totalPages={availablePagination.totalPages}
        pageSize={pageSize}
        totalItems={availablePagination.total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default Orders;