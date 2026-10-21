import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// 1) Agrega el token a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// 2) Cierra la sesión solo si el servidor dice que el token es inválido
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const detail = error.response?.data?.detail || '';
    if (error.response?.status === 401 && /token/i.test(detail) && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;