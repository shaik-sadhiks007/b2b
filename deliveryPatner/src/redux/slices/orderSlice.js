import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDeliveryPartnerOrdersApi, updateDeliveryPartnerOrderStatusApi, getAvailableDeliveryOrdersApi, acceptDeliveryOrderApi, acceptMultipleDeliveryOrdersApi, getAllBusinessNamesApi, getDeliveryPartnerBusinessNamesApi, getCompletedDeliveryPartnerOrdersApi } from '../../api/Api';

export const fetchDeliveryPartnerOrders = createAsyncThunk(
  'orders/fetchDeliveryPartnerOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getDeliveryPartnerOrdersApi(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAvailableDeliveryOrders = createAsyncThunk(
  'orders/fetchAvailableDeliveryOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAvailableDeliveryOrdersApi(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const acceptDeliveryOrder = createAsyncThunk(
  'orders/acceptDeliveryOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await acceptDeliveryOrderApi(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDeliveryPartnerOrderStatus = createAsyncThunk(
  'orders/updateDeliveryPartnerOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await updateDeliveryPartnerOrderStatusApi(orderId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const acceptMultipleDeliveryOrders = createAsyncThunk(
  'orders/acceptMultipleDeliveryOrders',
  async (orderIds, { rejectWithValue }) => {
    try {
      const response = await acceptMultipleDeliveryOrdersApi(orderIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompletedDeliveryPartnerOrders = createAsyncThunk(
  'orders/fetchCompletedDeliveryPartnerOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getCompletedDeliveryPartnerOrdersApi(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBusinessNames = createAsyncThunk(
  'orders/fetchBusinessNames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllBusinessNamesApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDeliveryPartnerBusinessNames = createAsyncThunk(
  'orders/fetchDeliveryPartnerBusinessNames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDeliveryPartnerBusinessNamesApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    availableOrders: [],
    completedOrders: [],
    businessNames: [],
    deliveryPartnerBusinessNames: [],
    loading: false,
    availableLoading: false,
    completedLoading: false,
    businessNamesLoading: false,
    deliveryPartnerBusinessNamesLoading: false,
    error: null,
    availableError: null,
    completedError: null,
    businessNamesError: null,
    deliveryPartnerBusinessNamesError: null,
    pagination: {
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    },
    availablePagination: {
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    },
    completedPagination: {
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryPartnerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryPartnerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDeliveryPartnerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailableDeliveryOrders.pending, (state) => {
        state.availableLoading = true;
        state.availableError = null;
      })
      .addCase(fetchAvailableDeliveryOrders.fulfilled, (state, action) => {
        state.availableLoading = false;
        state.availableOrders = action.payload.orders;
        state.availablePagination = action.payload.pagination;
      })
      .addCase(fetchAvailableDeliveryOrders.rejected, (state, action) => {
        state.availableLoading = false;
        state.availableError = action.payload;
      })
      .addCase(acceptDeliveryOrder.fulfilled, (state, action) => {
        // Remove accepted order from availableOrders and add to orders
        const acceptedOrder = action.payload;
        state.availableOrders = state.availableOrders.filter(order => order._id !== acceptedOrder._id);
        state.orders = [acceptedOrder, ...state.orders];
      })
      .addCase(acceptMultipleDeliveryOrders.fulfilled, (state, action) => {
        // Remove accepted orders from availableOrders and add to orders
        const acceptedOrders = action.payload.orders;
        const acceptedOrderIds = acceptedOrders.map(order => order._id);
        state.availableOrders = state.availableOrders.filter(order => !acceptedOrderIds.includes(order._id));
        state.orders = [...acceptedOrders, ...state.orders];
      })
      .addCase(updateDeliveryPartnerOrderStatus.fulfilled, (state, action) => {
        // Update the order in the list
        const updatedOrder = action.payload;
        state.orders = state.orders.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
      })
      .addCase(fetchCompletedDeliveryPartnerOrders.pending, (state) => {
        state.completedLoading = true;
        state.completedError = null;
      })
      .addCase(fetchCompletedDeliveryPartnerOrders.fulfilled, (state, action) => {
        state.completedLoading = false;
        state.completedOrders = action.payload.orders;
        state.completedPagination = action.payload.pagination;
      })
      .addCase(fetchCompletedDeliveryPartnerOrders.rejected, (state, action) => {
        state.completedLoading = false;
        state.completedError = action.payload;
      })
      .addCase(fetchBusinessNames.pending, (state) => {
        state.businessNamesLoading = true;
        state.businessNamesError = null;
      })
      .addCase(fetchBusinessNames.fulfilled, (state, action) => {
        state.businessNamesLoading = false;
        state.businessNames = action.payload.businessNames;
      })
      .addCase(fetchBusinessNames.rejected, (state, action) => {
        state.businessNamesLoading = false;
        state.businessNamesError = action.payload;
      })
      .addCase(fetchDeliveryPartnerBusinessNames.pending, (state) => {
        state.deliveryPartnerBusinessNamesLoading = true;
        state.deliveryPartnerBusinessNamesError = null;
      })
      .addCase(fetchDeliveryPartnerBusinessNames.fulfilled, (state, action) => {
        state.deliveryPartnerBusinessNamesLoading = false;
        state.deliveryPartnerBusinessNames = action.payload.businessNames;
      })
      .addCase(fetchDeliveryPartnerBusinessNames.rejected, (state, action) => {
        state.deliveryPartnerBusinessNamesLoading = false;
        state.deliveryPartnerBusinessNamesError = action.payload;
      });
  },
});

export default orderSlice.reducer; 