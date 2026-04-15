const envApiBase = (import.meta.env.VITE_API_BASE || '').toString().trim();

const localHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
const defaultApiBase = `${window.location.protocol}//${localHost}:5000`;

export const API_BASE = (envApiBase || defaultApiBase).replace(/\/+$/, '');

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export const resolveAssetUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
