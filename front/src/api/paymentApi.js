import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/apiConfig';

const BASE_URL = API_BASE_URL;

export async function fetchMetodosPago(clienteId) {
    try {
      const response = await fetch(`${BASE_URL}/clientes/me/metodos-pago?clienteId=${clienteId}`);
      if (!response.ok) throw new Error('Error al obtener los métodos de pago');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
};