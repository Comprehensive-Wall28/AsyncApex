import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Avatar, Chip, Stack, CircularProgress } from '@mui/material';
import api from '../api';
import type { Task } from '../api/interface';
import { tokens } from '../theme/theme';
import { S3Image } from './S3Image';

interface TaskBoardProps {
  teamId?: string;
  role: 'manager' | 'employee';
  refreshKey?: number;
  onTaskClick?: (task: Task) => void;
}

// Priority colour mapping references centralized tokens.
const priorityColorMap: Record<string, string> = {
  high:   tokens.errorMain,
  medium: tokens.warningMain,
  low:    tokens.successMain,
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ teamId, role, refreshKey, onTaskClick }) => {
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

  useEffect(() => { fetchTasks(); }, [teamId, role, refreshKey]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = tasks.find(t => t.taskId === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));

    try {
      if (task.status === 'todo' && newStatus === 'in-progress') await api.tasks.start(taskId);
      else if (task.status === 'in-progress' && newStatus === 'in-review') await api.tasks.submit(taskId);
      else if (task.status === 'in-review' && newStatus === 'done' && role === 'manager') await api.tasks.approve(taskId);
      else if (task.status === 'in-review' && newStatus === 'in-progress' && role === 'manager') await api.tasks.reject(taskId);
      else await api.tasks.update(taskId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      fetchTasks();
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
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
      {columns.map(col => (
        <Box
          key={col.id}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            p: 2.5,
            minHeight: '70vh',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, px: 0.5 }}>
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 800, color: 'text.primary', letterSpacing: '0.02em' }}>
              {col.title}
            </Typography>
            <Chip 
              label={tasks.filter(t => t.status === col.id).length} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'text.secondary',
                borderRadius: '6px'
              }} 
            />
          </Box>

          <Stack spacing={1.5}>
            {tasks.filter(t => t.status === col.id).map(task => {
              const priorityColor = priorityColorMap[task.priority] || tokens.textSecondary;
              return (
                <Card
                  key={task.taskId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.taskId)}
                  onClick={() => onTaskClick?.(task)}
                  sx={{
                    p: 2,
                    cursor: 'grab',
                    bgcolor: 'background.default',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(255, 255, 255, 0.05)'
                    },
                    '&:active': { cursor: 'grabbing' }
                  }}
                >
                  {task.imageKey && (
                    <Box sx={{ width: '100%', height: 100, borderRadius: '6px', mb: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <S3Image 
                        imageKey={task.imageKey} 
                        sx={{ width: '100%', height: '100%' }} 
                      />
                    </Box>
                  )}
                  <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.875rem', color: 'text.primary' }}>
                    {task.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={task.priority.toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: priorityColor,
                        bgcolor: `${priorityColor}1A`,
                        border: `1px solid ${priorityColor}33`,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                    <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.dark', fontSize: '0.65rem', fontWeight: 700 }}>
                      {task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : '?'}
                    </Avatar>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};
