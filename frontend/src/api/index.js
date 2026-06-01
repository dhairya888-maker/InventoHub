import api from './axios';

export const productsApi = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data) => api.post('/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  lowStock: (threshold = 10) =>
    api.get('/products/low-stock', { params: { threshold } }).then((r) => r.data),
};

export const customersApi = {
  list: (params) => api.get('/customers', { params }).then((r) => r.data),
  get: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => api.post('/customers', data).then((r) => r.data),
  update: (id, data) => api.put(`/customers/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/customers/${id}`).then((r) => r.data),
};

export const ordersApi = {
  list: (params) => api.get('/orders', { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => api.post('/orders', data).then((r) => r.data),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
  revenueChart: (months = 12) =>
    api.get('/dashboard/revenue-chart', { params: { months } }).then((r) => r.data),
  orderTrends: (months = 12) =>
    api.get('/dashboard/order-trends', { params: { months } }).then((r) => r.data),
  lowStock: () => api.get('/dashboard/low-stock').then((r) => r.data),
  recentOrders: (limit = 10) =>
    api.get('/dashboard/recent-orders', { params: { limit } }).then((r) => r.data),
};
