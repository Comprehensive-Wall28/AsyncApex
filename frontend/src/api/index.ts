import { client } from './client';

/**
 * API services organized by resource.
 * This centralized structure makes it easy to manage endpoints and types.
 */
export const api = {
  tasks: {
    getAll: () => client.get('/tasks'),
    getOne: (id: string) => client.get(`/tasks/${id}`),
    create: (data: any) => client.post('/tasks', data),
    update: (id: string, data: any) => client.patch(`/tasks/${id}`, data),
    delete: (id: string) => client.delete(`/tasks/${id}`),
  },

  auth: {
    login: (credentials: any) => client.post('/auth/signin', credentials),
    signup: (data: any) => client.post('/auth/signup', data),
    logout: (email?: string) => client.post('/auth/signout', { email }),
  },

  status: {
    check: () => client.get('/status'),
  }
};

export default api;
