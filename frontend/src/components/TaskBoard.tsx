import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Avatar, Chip, Stack, CircularProgress } from '@mui/material';
import api from '../api';

interface Task {
  taskId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  imageKey?: string;
}

interface TaskBoardProps {
  teamId?: string;
  role: 'manager' | 'employee';
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'default';
  }
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ teamId, role }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.tasks.getAll({ teamId: role === 'manager' ? teamId : undefined });
      setTasks(data as any);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [teamId, role]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find(t => t.taskId === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));

    try {
      if (task.status === 'todo' && newStatus === 'in-progress') await api.tasks.start(taskId);
      else if (task.status === 'in-progress' && newStatus === 'in-review') await api.tasks.submit(taskId);
      else if (task.status === 'in-review' && newStatus === 'done' && role === 'manager') await api.tasks.approve(taskId);
      else if (task.status === 'in-review' && newStatus === 'in-progress' && role === 'manager') await api.tasks.reject(taskId);
      else await api.tasks.update(taskId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      fetchTasks(); // Revert on failure
    }
  };

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'in-review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
      {columns.map(col => (
        <Box
          key={col.id}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
          sx={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            p: 2,
            minHeight: 500,
            border: '1px solid rgba(139, 92, 246, 0.1)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, px: 1, fontSize: '1.1rem', color: 'text.secondary' }}>
            {col.title} <Typography component="span" sx={{ fontSize: '0.8rem', opacity: 0.5 }}>({tasks.filter(t => t.status === col.id).length})</Typography>
          </Typography>
          
          <Stack spacing={2}>
            {tasks.filter(t => t.status === col.id).map(task => (
              <Card
                key={task.taskId}
                draggable
                onDragStart={(e) => handleDragStart(e, task.taskId)}
                sx={{
                  p: 2,
                  cursor: 'grab',
                  background: 'rgba(13, 13, 26, 0.7)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
                }}
              >
                {task.imageKey && (
                  <Box
                    sx={{
                      width: '100%',
                      height: 100,
                      borderRadius: '8px',
                      mb: 2,
                      background: 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontSize: '0.8rem'
                    }}
                  >
                    [S3 Image Placeholder]
                  </Box>
                )}
                <Typography sx={{ fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>{task.title}</Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip 
                    label={task.priority.toUpperCase()} 
                    size="small" 
                    color={getPriorityColor(task.priority) as any}
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                  />
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.dark', fontSize: '0.7rem' }}>
                    {task.assigneeId ? task.assigneeId.substring(0,2).toUpperCase() : '?'}
                  </Avatar>
                </Box>
              </Card>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};
