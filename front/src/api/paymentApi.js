import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/apiConfig';
import { getToken } from '../auth/authManager';

const BASE_URL = `${API_BASE_URL}/clientes/me/metodos-pago`;

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function extraerMensajeError(response) {
  try {
    const texto = await response.text();
    if (!texto) return `Error ${response.status}`;
    try {
      const json = JSON.parse(texto);
      return json.mensaje ?? json.message ?? json.error ?? texto;
    } catch (_) {
      return texto; // texto plano
    }
  } catch (_) {
    return `Error ${response.status}`;
  }
}

export async function fetchMetodosPago() {
  try {
    const response = await fetch(BASE_URL, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(await extraerMensajeError(response));
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchMetodoPagoPorId(id, tipo) {
  try {
    const response = await fetch(`${BASE_URL}/${id}?tipo=${tipo}`, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(await extraerMensajeError(response));
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createMetodoPago(data) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extraerMensajeError(response));
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateMetodoPago(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extraerMensajeError(response));
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteMetodoPago(id, tipo) {
  try {
    const response = await fetch(`${BASE_URL}/${id}?tipo=${tipo}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(await extraerMensajeError(response));
    }
    return { id, tipo };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function completarPago(subastaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/compras/${subastaId}/completar-pago`, {
      method: 'POST',
      headers: authHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error('Error al completar el pago');
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}