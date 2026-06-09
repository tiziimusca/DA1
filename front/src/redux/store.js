import { configureStore } from '@reduxjs/toolkit';
import subastaReducer from './slices/subastaSlice';
import productoReducer from './slices/productoSlice';
import metodoPagoReducer from './slices/metodoPagoSlice';

export const store = configureStore({
  reducer: {
    subastas: subastaReducer,
    productos: productoReducer,
    metodoPago: metodoPagoReducer
  },
});
