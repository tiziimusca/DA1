import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/apiConfig';

const BASE_URL = API_BASE_URL;

async function parseError(response) {
  const raw = await response.text();
  try {
    const body = raw ? JSON.parse(raw) : null;
    return body?.message || body?.error || raw || `Error ${response.status}`;
  } catch {
    return raw || `Error ${response.status}`;
  }
}

export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error);
  }

  return response.json();
}

export async function fetchProfile(token) {
  const response = await fetch(`${BASE_URL}/clientes/perfil`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error);
  }

  return response.json();
}

export async function solicitarCodigo(email) {
  const response = await fetch(`${BASE_URL}/auth/solicitar-codigo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error);
  }

  return true;
}

export async function verificarCodigo(codigo) {
  const response = await fetch(`${BASE_URL}/auth/verificar-codigo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error);
  }

  const json = await response.json();
  return json;
}

export async function resetPassword(tokenReseteo, nuevaPassword, confirmarPassword) {
  const response = await fetch(`${BASE_URL}/auth/resetear-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenReseteo}`,
    },
    body: JSON.stringify({ tokenReseteo, nuevaPassword, confirmarPassword }),
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error);
  }

  return true;
}

export async function updateProfile(token, payload) {
  const response = await fetch(`${BASE_URL}/clientes/perfil`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error);
  }

  const json = await response.json();
  return json;
}
