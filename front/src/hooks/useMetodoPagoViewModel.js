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

  const dispatch = useDispatch();
 
  const { lista, detalle, loading, error } = useSelector(
    (state) => state.metodoPago
  );
 
  // El cliente lo deriva el back del token (Authorization), no hace falta clienteId.
  const cargarTodos = () => {
    dispatch(fetchMetodosPago());
  };

  const cargarPorId = (id, tipo) => {
    dispatch(fetchMetodoPagoPorId({ id, tipo }));
  };

  const agregarMetodoPago = ({ data }) => {
    return dispatch(createMetodoPago({ data }));
  };

    const editarMetodoPago = (id, data) => {
    return dispatch(updateMetodoPago({ id, data }));
    };

    const borrarMetodoPago = (id, tipo) => {
    return dispatch(deleteMetodoPago({ id, tipo }));
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