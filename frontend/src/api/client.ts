import axios from 'axios';

// 1. Create the Axios instance pointing to your backend
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://100.99.68.16:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. REQUEST INTERCEPTOR: Attach the token to every request
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR: Handle 401/403 errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only redirect if we are NOT already on the login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/change-password') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);