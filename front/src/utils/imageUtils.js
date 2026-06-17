import { SERVER_BASE_URL } from '../config/apiConfig';

const HOST_URL = SERVER_BASE_URL;

/**
 * Decodifica cualquier formato de foto que venga del backend
 * (URL directa, /api/, URL-encoded, hex ASCII, base64)
 * y devuelve una URI lista para usar en <Image source={{ uri }} />
 */
export const decodeImageUri = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  if (foto.startsWith('/api/')) return `${HOST_URL}${foto}`;

  // Intento URL-decode
  try {
    const decoded = decodeURIComponent(foto);
    if (decoded.startsWith('http')) return decoded;
  } catch {}

  // Intento hex → ASCII
  try {
    const prefix = foto.match(/^[0-9a-fA-F]+/);
    if (prefix && prefix[0].length >= 8) {
      const cleaned = prefix[0];
      const even = cleaned.length % 2 === 1 ? cleaned + '0' : cleaned;
      let out = '';
      for (let i = 0; i < even.length; i += 2) {
        out += String.fromCharCode(parseInt(even.substr(i, 2), 16));
      }
      if (out.startsWith('http')) return out;
    }
  } catch {}

  // Intento base64
  if (/^[A-Za-z0-9+/]+=*$/.test(foto.replace(/\s+/g, ''))) {
    return `data:image/jpeg;base64,${foto}`;
  }

  return null;
};