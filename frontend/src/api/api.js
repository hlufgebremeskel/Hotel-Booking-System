import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'  //Backend port
});

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Only clear and redirect if not already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
        localStorage.clear();
        window.dispatchEvent(new Event('userUpdated'));
        // Don't redirect automatically - let the ProtectedRoute handle it
      }
    }
    return Promise.reject(error);
  }
);

export default api;
