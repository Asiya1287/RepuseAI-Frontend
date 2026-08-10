import axios from 'axios';

// All API requests use process.env.REACT_APP_API_URL
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://repuse-ai.vercel.app';

const api = axios.create({
  baseURL: "https://repuse-ai.vercel.app",
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function registerBusiness(data) {
  const response = await api.post('/business/register', data);
  return response.data;
}

export async function loginBusiness(data) {
  const response = await api.post('/business/login', data);
  return response.data;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function addCustomer(data) {
  const response = await api.post('/customers', data);
  return response.data;
}

export async function getCustomers() {
  const response = await api.get('/customers');
  return response.data;
}

export async function cancelCustomer(id) {
  const response = await api.patch(`/customers/${id}/cancel`);
  return response.data;
}

export async function getStats() {
  const response = await api.get('/customers/stats');
  return response.data;
}

export default api;
