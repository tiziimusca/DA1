import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8080/api'
  : 'http://192.168.0.181:8080/api';

async function parseError(response) {
  const raw = await response.text();
  try {
    const body = raw ? JSON.parse(raw) : null;
    return body?.message || body?.error || raw || `Error ${response.status}`;
  } catch {
    return raw || `Error ${response.status}`;
  }
}

export async function fetchSubastas() {
  const response = await fetch(`${BASE_URL}/subastas`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function fetchProductos() {
  const response = await fetch(`${BASE_URL}/productos`);
  return response.json();
}

export async function fetchProducto(id) {
  const response = await fetch(`${BASE_URL}/productos/${id}`);
  return response.json();
}

export async function fetchCatalogo(subastaId, authHeader) {
  const response = await fetch(`${BASE_URL}/subastas/${subastaId}/catalogo`, {
    headers: authHeader ? { Authorization: authHeader } : undefined,
  });
  if (response.status === 204) {
    return { items: [] };
  }
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function fetchHomeDashboard(authToken) {
  const response = await fetch(`${BASE_URL}/home`, {
    headers: authToken ? { Authorization: authToken } : undefined,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function fetchPujas() {
  const response = await fetch(`${BASE_URL}/pujas`);
  return response.json();
}

export async function fetchRegistrosSubasta() {
  const response = await fetch(`${BASE_URL}/registros-subasta`);
  return response.json();
}

export function createWebSocket(onMessage, onOpen, onError) {
  const socket = new WebSocket(Platform.OS === 'web' ? 'ws://localhost:8080/ws/bids' : 'ws://192.168.0.181:8080/ws/bids');

  socket.onopen = () => {
    if (onOpen) onOpen();
  };

  socket.onmessage = event => {
    if (onMessage) {
      try {
        onMessage(JSON.parse(event.data));
      } catch (error) {
        onMessage({ raw: event.data });
      }
    }
  };

  socket.onerror = event => {
    if (onError) onError(event);
  };

  return socket;
}

export function sendBid(socket, bid) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(bid));
  }
}
