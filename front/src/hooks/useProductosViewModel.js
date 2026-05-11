import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductos,
  fetchProductoPorId,
  fetchDisponibles,
  clearError,
  clearDetalle,
} from '../redux/slices/productoSlice';

/**
 * ViewModel para Productos
 * Maneja el estado y lógica de productos
 */
export const useProductosViewModel = () => {
  const dispatch = useDispatch();
  const { lista, disponibles, detalle, loading, error } = useSelector(
    (state) => state.productos
  );

  const cargarTodos = () => {
    dispatch(fetchProductos());
  };

  const cargarPorId = (id) => {
    dispatch(fetchProductoPorId(id));
  };

  const cargarDisponibles = () => {
    dispatch(fetchDisponibles());
  };

  const limpiarError = () => {
    dispatch(clearError());
  };

  const limpiarDetalle = () => {
    dispatch(clearDetalle());
  };

  return {
    productos: lista,
    productosDisponibles: disponibles,
    productoDetalle: detalle,
    loading,
    error,
    cargarTodos,
    cargarPorId,
    cargarDisponibles,
    limpiarError,
    limpiarDetalle,
  };
};
