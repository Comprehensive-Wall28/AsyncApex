import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...customOptions } = options;

  const url = new URL(
    `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
    window.location.origin
  );

  if (params) {
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
  }

  const token = localStorage.getItem('idToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customOptions.headers as Record<string, string>),
  };

  if (token && !endpoint.includes('/auth/signin') && !endpoint.includes('/auth/signup')) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
  };

  try {
    const response = await fetch(url.toString(), config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.message || `API error: ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        localStorage.removeItem('idToken');
        localStorage.removeItem('user');

        toast.error('Session expired. Please log in again.');

        setTimeout(() => {
          window.location.href = '/login';
        }, 800);
      } else {

        console.error(message);
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

export const client = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};