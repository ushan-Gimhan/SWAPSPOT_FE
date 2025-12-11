import axios, { AxiosError } from 'axios';
import { refreshTokens } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register'];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const isPublic = PUBLIC_ENDPOINTS.some((url) => config.url?.includes(url));

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config
    const isPublic = PUBLIC_ENDPOINTS.some((url) => 
      originalRequest.url?.includes(url)
    )

    if (error.response?.status === 401 && !isPublic && !originalRequest._retry) {
      originalRequest._retry = true   // hriyt token ek enne nathnm retry krnw
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        const res = await refreshTokens(refreshToken)
        localStorage.setItem('accessToken', res.accessToken)

        originalRequest.headers.Authorization = `Bearer ${res.accessToken}`

        return axios(originalRequest) // Retry the original request with the new token
      } catch (error) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login' // Redirect to login on failure
        console.error('Token refresh failed', error)
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api;
