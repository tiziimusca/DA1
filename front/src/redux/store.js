import { configureStore } from '@reduxjs/toolkit';
import subastaReducer from './slices/subastaSlice';
import metodoPagoReducer from './slices/metodoPagoSlice';

export const store = configureStore({
  reducer: {
    subastas: subastaReducer,
    metodoPago: metodoPagoReducer
  },
});
