import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage on authentication error
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Products endpoints
export const products = {
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
};

// Purchases endpoints
export const purchases = {
  getAll: () => api.get('/purchases'),
  create: (data) => api.post('/purchases', data),
  updateStatus: (id, status) => api.patch(`/purchases/${id}/status`, { status }),
};

// Shipments endpoints
export const shipments = {
  getAll: () => api.get('/shipments'),
  getOne: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post('/shipments', data),
  updateStatus: (id, data) => api.patch(`/shipments/${id}/status`, data),
};

export default api; 