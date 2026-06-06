let token = null;
let user = null;

export function setSession(session) {
  token = session?.token || null;
  user = session?.user || null;
}

export function clearSession() {
  token = null;
  user = null;
}

export function getToken() {
  return token;
}

export function getUser() {
  return user;
}

export function isAuthenticated() {
  return !!token;
}
