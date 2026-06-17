import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/apiConfig';
import { getToken } from '../auth/authManager';

const BASE_URL = API_BASE_URL;

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchMetodosPago(clienteId) {
    try {
      const response = await fetch(`${BASE_URL}/clientes/me/metodos-pago`, { headers: authHeaders() });
      if (!response.ok) throw new Error('Error al obtener los métodos de pago');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
};