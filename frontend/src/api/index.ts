import { client } from './client';
import type { StatusStats } from './interface';

/**
 * API services organized by resource.
 * This centralized structure makes it easy to manage endpoints and types.
 */
export const api = {
  teams: {
    getAll: () => client.get('/teams'),
    getOne: (id: string) => client.get(`/teams/${id}`),
    create: (data: any) => client.post('/teams', data),
    update: (id: string, data: any) => client.patch(`/teams/${id}`, data),
    delete: (id: string) => client.delete(`/teams/${id}`),
    addUser: (teamId: string, userId: string) => client.post(`/teams/${teamId}/users`, { userId }),
  },
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
    getLogs: (id: string) => client.get(`/tasks/${id}/logs`),
  },

  projects: {
    getAll: (params?: { teamId?: string; assigneeId?: string; status?: string; projectId?: string }) =>
      client.get('/projects', { params }),
    getOne: (id: string) => client.get(`/projects/${id}`),
    create: (data: any) => client.post('/projects', data),
    // For file uploads, we need to skip the default JSON Content-Type
    createWithFile: async (formData: FormData) => {
      const token = localStorage.getItem('idToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/projects`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    update: (id: string, data: any) => client.patch(`/projects/${id}`, data),
    updateWithFile: async (id: string, formData: FormData) => {
      const token = localStorage.getItem('idToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/projects/${id}`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update project');
      return res.json();
    },
    delete: (id: string) => client.delete(`/projects/${id}`),
    start: (id: string) => client.post(`/projects/${id}/start`),
    submit: (id: string) => client.post(`/projects/${id}/submit`),
    approve: (id: string) => client.post(`/projects/${id}/approve`),
    reject: (id: string) => client.post(`/projects/${id}/reject`),
  },

  users: {
    getAll: () => client.get('/users'),
    getOne: (id: string) => client.get(`/users/${id}`),
  },

  auth: {
    login: (credentials: any) => client.post('/auth/signin', credentials),
    signup: (data: any) => client.post('/auth/signup', data),
    logout: (email?: string) => client.post('/auth/signout', { email }),
  },

  status: {
    check: () => client.get<StatusStats>('/status'),
  },

  s3: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('idToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/s3/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload file');
      return res.json();
    },
    getPresignedUrl: (key: string, bucket?: string) => 
      client.get<{ url: string }>(`/s3/presigned/${key}${bucket ? `?bucket=${bucket}` : ''}`),
  },

  comments: {
    getByTask: (taskId: string) => client.get(`/comments/by-task/${taskId}`),
    create: (data: { taskId: string; content: string }) => client.post('/comments', data),
    delete: (id: string) => client.delete(`/comments/${id}`),
  }
};

export default api;
