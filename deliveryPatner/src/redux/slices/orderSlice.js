import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDeliveryPartnerOrdersApi, updateDeliveryPartnerOrderStatusApi, getAvailableDeliveryOrdersApi, acceptDeliveryOrderApi, getCompletedDeliveryPartnerOrdersApi } from '../../api/Api';

export const fetchDeliveryPartnerOrders = createAsyncThunk(
  'orders/fetchDeliveryPartnerOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDeliveryPartnerOrdersApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAvailableDeliveryOrders = createAsyncThunk(
  'orders/fetchAvailableDeliveryOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAvailableDeliveryOrdersApi();
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

export const fetchCompletedDeliveryPartnerOrders = createAsyncThunk(
  'orders/fetchCompletedDeliveryPartnerOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCompletedDeliveryPartnerOrdersApi();
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
    loading: false,
    availableLoading: false,
    completedLoading: false,
    error: null,
    availableError: null,
    completedError: null,
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
        state.orders = action.payload;
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
        state.availableOrders = action.payload;
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
        state.completedOrders = action.payload;
      })
      .addCase(fetchCompletedDeliveryPartnerOrders.rejected, (state, action) => {
        state.completedLoading = false;
        state.completedError = action.payload;
      });
  },
});

export default orderSlice.reducer; 