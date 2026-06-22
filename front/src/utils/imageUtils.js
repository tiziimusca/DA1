import { SERVER_BASE_URL } from '../config/apiConfig';

const HOST_URL = SERVER_BASE_URL;

export const decodeImageUri = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  if (foto.startsWith('/api/')) return `${HOST_URL}${foto}`;

  try {
    const decoded = decodeURIComponent(foto);
    if (decoded.startsWith('http')) return decoded;
  } catch {}

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

    return `data:image/jpeg;base64,${foto}`;
  }

  return null;
};