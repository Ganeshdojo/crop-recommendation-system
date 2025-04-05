import axios from 'axios';

const API_URL = "http://localhost:8000/api"; // Adjust port if neede

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define API endpoints
export const endpoints = {
  // Auth endpoints (fallback if not using Clerk)
  auth: {
    login: (data: { email: string; password: string }) => 
      api.post('/auth/login/', data),
    register: (data: { name: string; email: string; password: string }) => 
      api.post('/auth/register/', data),
    logout: () => api.post('/auth/logout/'),
    me: () => api.get('/auth/me/'),
  },
  
  // Prediction endpoints
  prediction: {
    predict: (data: {
      N: number;
      P: number;
      K: number;
      temperature: number;
      humidity: number;
      pH: number;
      rainfall: number;
    }) => api.post('/predictions/', data),
    getHistory: () => api.get('/predictions/'),
    getPrediction: (id: string) => api.get(`/predictions/${id}/`),
  },
  
  // Training endpoints
  training: {
    uploadDataset: (data: FormData) => api.post('/datasets/upload/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    trainModel: (data: { dataset_id: string; algorithm: string }) => api.post('/models/train/', {
      dataset_id: data.dataset_id,
      algorithm: data.algorithm === 'randomForest' ? 'random_forest' : 'xgboost',
      params: {
        random_state: 42,
        n_estimators: 100,
        test_size: 0.2
      }
    }),
    getModels: () => api.get('/models/'),
    getModel: (id: string) => api.get(`/models/${id}/`),
    getStatus: (modelId: string) => api.get(`/models/${modelId}/status/`),
  },
  
  // Profile endpoints
  profile: {
    updateProfile: (data: any) => api.patch('/profile/', data),
    updatePassword: (data: { current_password: string; new_password: string }) => 
      api.post('/profile/password/', data),
    updateNotifications: (data: any) => api.patch('/profile/notifications/', data),
  },
};

export default api;
