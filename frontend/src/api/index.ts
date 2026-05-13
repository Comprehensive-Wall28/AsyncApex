import { client } from './client';

/**
 * API services organized by resource.
 * This centralized structure makes it easy to manage endpoints and types.
 */
export const api = {
  tasks: {
    getAll: (params?: { teamId?: string; assigneeId?: string; status?: string; projectId?: string }) => 
      client.get('/tasks', { params }),
    getOne: (id: string) => client.get(`/tasks/${id}`),
    create: (data: any) => client.post('/tasks', data),
    // For file uploads, we need to skip the default JSON Content-Type
    createWithFile: async (formData: FormData) => {
      const token = localStorage.getItem('idToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/tasks`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    update: (id: string, data: any) => client.patch(`/tasks/${id}`, data),
    updateWithFile: async (id: string, formData: FormData) => {
      const token = localStorage.getItem('idToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/tasks/${id}`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    delete: (id: string) => client.delete(`/tasks/${id}`),
    start: (id: string) => client.post(`/tasks/${id}/start`),
    submit: (id: string) => client.post(`/tasks/${id}/submit`),
    approve: (id: string) => client.post(`/tasks/${id}/approve`),
    reject: (id: string) => client.post(`/tasks/${id}/reject`),
  },

  users: {
    getOne: (id: string) => client.get(`/users/${id}`),
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
