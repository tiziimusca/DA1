const BASE_URL = 'http://10.0.2.2:8080/api';

export async function fetchSubastas() {
  const response = await fetch(`${BASE_URL}/subastas`);
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

export function createWebSocket(onMessage, onOpen, onError) {
  const socket = new WebSocket('ws://10.0.2.2:8080/ws/bids');

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
