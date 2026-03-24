import axios from 'axios';

const API_PATH = process.env.REACT_APP_API_PATH;

const api = axios.create({
  baseURL: API_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  patch: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const orderService = {
  getAll: () => api.get('/orderTable'),
  getById: (id) => api.get(`/orderTable/${id}`),
  create: (data) => api.post('/orderTable', data),
  update: (id, data) => api.put(`/orderTable/${id}`, data),
  delete: (id) => api.delete(`/orderTable/${id}`),
};

export const couponService = {
  getAll: () => api.get('/Coupons'),
  getById: (id) => api.get(`/Coupons/${id}`),
  update: (id, data) => api.patch(`/Coupons/${id}`, data),
};

export const reviewService = {
  getAll: () => api.get('/reviews'),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
};

export const disputeService = {
  getAll: () => api.get('/disputes'),
  update: (id, data) => api.patch(`/disputes/${id}`, data),
};

export const returnRequestService = {
  getAll: () => api.get('/returnRequests'),
  update: (id, data) => api.patch(`/returnRequests/${id}`, data),
};

export const dashboardService = {
  getConfig: (params) => api.get('/dashboardConfigs', { params }),
  updateConfig: (id, data) => api.put(`/dashboardConfigs/${id}`, data), // DashboardConfig uses PUT
};

export const logService = {
  getAll: () => api.get('/logs'),
  create: (data) => api.post('/logs', data),
};

export const orderItemService = {
  getAll: () => api.get('/orderItem'),
  getById: (id) => api.get(`/orderItem/${id}`),
};

export const adminService = {
  getById: (id) => api.get(`/admins/${id}`),
  update: (id, data) => api.patch(`/admins/${id}`, data),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
};

// Generic service for any other unexpected resources
export const genericService = (resource) => ({
  getAll: () => api.get(`/${resource}`),
  getById: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  patch: (id, data) => api.patch(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`),
});

export default api;
