import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubastas,
  fetchAbiertas,
  fetchProximas,
  clearError,
} from '../redux/slices/subastaSlice';

/**
 * ViewModel para Subastas
 * Maneja el estado y lógica de subastas
 */
export const useSubastasViewModel = () => {
  const dispatch = useDispatch();
  const { lista, abiertas, proximas, loading, error } = useSelector(
    (state) => state.subastas
  );

  const cargarTodas = () => {
    dispatch(fetchSubastas());
  };

  const cargarAbiertas = () => {
    dispatch(fetchAbiertas());
  };

  const cargarProximas = () => {
    dispatch(fetchProximas());
  };

  const limpiarError = () => {
    dispatch(clearError());
  };

  return {
    subastas: lista,
    subastaAbiertas: abiertas,
    subastaProximas: proximas,
    loading,
    error,
    cargarTodas,
    cargarAbiertas,
    cargarProximas,
    limpiarError,
  };
};
