import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config.ts';

// Create a custom axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Store current initData
let currentInitData: string | undefined;

// Request interceptor to add auth header with Telegram Mini App init data
apiClient.interceptors.request.use(
  (config) => {
    // Use the current initData if available
    if (currentInitData && config.headers) {
      config.headers['Authorization'] = `tma ${currentInitData}`;
    } else {
      // Log when initData is missing for debugging
      console.warn('API Request without initData:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here (like 401, 403, 500, etc.)
    console.error('API Error:', error);
    
    // You can add custom error handling logic here
    // For example, redirect to login page on 401, show error message, etc.
    
    return Promise.reject(error);
  }
);

// Helper function to set the initData
export const setInitData = (initData: string | undefined) => {
  currentInitData = initData;
  console.log('InitData set:', initData ? 'present' : 'cleared');
};

// Helper function to get current initData (for debugging)
export const getCurrentInitData = () => currentInitData;

export default apiClient; 