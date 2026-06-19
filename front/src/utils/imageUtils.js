import { SERVER_BASE_URL } from '../config/apiConfig';

const HOST_URL = SERVER_BASE_URL;

/**
 * Decodifica cualquier formato de foto que venga del backend
 * (URL directa, /api/, URL-encoded, hex ASCII, base64-de-texto, base64-de-imagen)
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

  // Intento hex → ASCII (solo si TODO el string es hex válido y suficientemente largo,
  // para no confundir un prefijo corto que coincide por casualidad con dígitos hex)
  try {
    if (/^[0-9a-fA-F]+$/.test(foto) && foto.length >= 16) {
      const cleaned = foto;
      const even = cleaned.length % 2 === 1 ? cleaned + '0' : cleaned;
      let out = '';
      for (let i = 0; i < even.length; i += 2) {
        out += String.fromCharCode(parseInt(even.substr(i, 2), 16));
      }
      if (out.startsWith('http')) return out;
    }
  } catch {}

  // Intento base64-de-texto: el backend a veces manda una URL codificada en base64
  // (no la imagen en sí, sino el string de la URL). Si al decodificar el base64
  // obtenemos texto plano que empieza con "http", es ese caso.
  const looksLikeBase64 = /^[A-Za-z0-9+/]+=*$/.test(foto.replace(/\s+/g, ''));
  if (looksLikeBase64) {
    try {
      const decodedText =
        typeof atob === 'function'
          ? atob(foto)
          : Buffer.from(foto, 'base64').toString('utf-8');
      if (decodedText.startsWith('http')) {
        return decodedText;
      }
    } catch {}

    // Si no decodificó a una URL de texto, asumimos que SÍ son los bytes
    // binarios de una imagen real en base64 (caso clásico de foto subida).
    return `data:image/jpeg;base64,${foto}`;
  }

  return null;
};