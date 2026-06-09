import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMetodosPago,
  fetchMetodoPagoPorId,
  createMetodoPago,
  updateMetodoPago,
  deleteMetodoPago,
  clearError,
  clearDetalle,
} from '../redux/slices/metodoPagoSlice';
 
export const useMetodosPagoViewModel = () => {

    const CLIENT_ID = 11;
  const dispatch = useDispatch();
 
  const { lista, detalle, loading, error } = useSelector(
    (state) => state.metodoPago
  );
 
  // clienteId requerido para el GET
  const cargarTodos = (clienteId) => {
    dispatch(fetchMetodosPago(clienteId));
  };
 
  const cargarPorId = (id, tipo) => {
    dispatch(fetchMetodoPagoPorId({ id, tipo, clienteId: CLIENT_ID }));
  };
 
  // FIXED: desestructuramos correctamente para no anidar doble
  const agregarMetodoPago = ({ data, clienteId }) => {
    return dispatch(createMetodoPago({ data, clienteId }));
  };
 
    const editarMetodoPago = (id, data) => {
    return dispatch(updateMetodoPago({ id, data, clienteId: CLIENT_ID }));
    };
    
    const borrarMetodoPago = (id, tipo) => {
    return dispatch(deleteMetodoPago({ id, tipo, clienteId: CLIENT_ID }));
    };
 
  const limpiarErrorActual = () => dispatch(clearError());
  const limpiarDetalleActual = () => dispatch(clearDetalle());
 
  return {
    metodosPago: lista,
    metodoDetalle: detalle,
    loading,
    error,
    cargarTodos,
    cargarPorId,
    agregarMetodoPago,
    editarMetodoPago,
    borrarMetodoPago,
    limpiarError: limpiarErrorActual,
    limpiarDetalle: limpiarDetalleActual,
  };
};