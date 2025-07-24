import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import deliveryPartnerRegReducer from './slices/deliveryPartnerRegSlice';
// import exampleReducer from './slices/exampleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    deliveryPartnerReg: deliveryPartnerRegReducer,
    // example: exampleReducer,
  },
});

export default store;