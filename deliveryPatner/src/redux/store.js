import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import deliveryPartnerRegReducer from './slices/deliveryPartnerRegSlice';
import orderReducer from './slices/orderSlice';
// import exampleReducer from './slices/exampleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    deliveryPartnerReg: deliveryPartnerRegReducer,
    orders: orderReducer,
    // example: exampleReducer,
  },
});

export default store;