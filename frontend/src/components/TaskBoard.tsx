import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Avatar, Chip, Stack, CircularProgress, IconButton } from '@mui/material';
import { 
  AddRounded, 
  RadioButtonUncheckedRounded, 
  AccessTimeRounded, 
  CheckCircleRounded,
  TuneRounded
} from '@mui/icons-material';
import api from '../api';
import type { Task } from '../api/interface';
import { tokens } from '../theme/theme';
import { S3Image } from './S3Image';

interface TaskBoardProps {
  teamId?: string;
  role: 'manager' | 'employee';
  refreshKey?: number;
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: Task['status']) => void;
}

// Priority colour mapping references centralized tokens.
const priorityColorMap: Record<string, string> = {
  high:   tokens.errorMain,
  medium: tokens.warningMain,
  low:    tokens.successMain,
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ teamId, role, refreshKey, onTaskClick, onAddTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedOverTaskId, setDraggedOverTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<string | null>(null);

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
    setDraggedTaskId(taskId);
  };

  const handleDragOverColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setActiveDropCol(colId);
  };

  const handleDragLeaveColumn = () => {
    setActiveDropCol(null);
  };

  const handleDragOverTask = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverTaskId(taskId);
  };

  const handleDrop = async (e: React.DragEvent, newColId: 'todo' | 'in-progress' | 'in-review' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDraggedTaskId(null);
    setDraggedOverTaskId(null);
    setActiveDropCol(null);

    if (!taskId) return;
    const taskIndex = tasks.findIndex(t => t.taskId === taskId);
    if (taskIndex === -1) return;
    const task = tasks[taskIndex];

    let targetStatus: Task['status'] = newColId;
    let newTasks = [...tasks];

    // Handle reordering within column or moving to a specific position
    if (draggedOverTaskId) {
      const overIndex = tasks.findIndex(t => t.taskId === draggedOverTaskId);
      if (overIndex !== -1) {
        newTasks.splice(taskIndex, 1);
        newTasks.splice(overIndex, 0, { ...task });
      }
    } else {
      newTasks.splice(taskIndex, 1);
      newTasks.push({ ...task });
    }

    // Workflow logic for status transition
    try {
      if (task.status === 'todo' && newColId === 'in-progress') {
        targetStatus = 'in-progress';
        await api.tasks.start(taskId);
      } else if (task.status === 'in-progress' && newColId === 'in-review') {
        targetStatus = 'in-review';
        await api.tasks.submit(taskId);
      } else if (task.status === 'in-review' && newColId === 'done' && role === 'manager') {
        targetStatus = 'done';
        await api.tasks.approve(taskId);
      } else if (task.status === 'in-review' && newColId === 'in-progress' && role === 'manager') {
        targetStatus = 'in-progress';
        await api.tasks.reject(taskId);
      } else {
        targetStatus = newColId;
        if (task.status !== newColId) {
          await api.tasks.update(taskId, { status: newColId });
        }
      }
      
      setTasks(newTasks.map(t => t.taskId === taskId ? { ...t, status: targetStatus } : t));
    } catch (error) {
      console.error('Failed to update status', error);
      fetchTasks();
    }
  };

  // Map functional statuses to visual columns
  const columns = [
    { id: 'todo' as const, title: 'To Do', icon: <RadioButtonUncheckedRounded sx={{ color: tokens.textSecondary }} />, statuses: ['todo'] },
    { id: 'in-progress' as const, title: 'In Progress', icon: <AccessTimeRounded sx={{ color: tokens.warningMain }} />, statuses: ['in-progress'] },
    { id: 'in-review' as const, title: 'In Review', icon: <TuneRounded sx={{ color: tokens.secondaryMain }} />, statuses: ['in-review'] },
    { id: 'done' as const, title: 'Done', icon: <CheckCircleRounded sx={{ color: tokens.successMain }} />, statuses: ['done'] },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
      {columns.map(col => {
        const columnTasks = tasks.filter((t: Task) => col.statuses.includes(t.status));
        
        return (
          <Box
            key={col.id}
            onDragOver={(e) => handleDragOverColumn(e, col.id)}
            onDragLeave={handleDragLeaveColumn}
            onDrop={(e) => handleDrop(e, col.id)}
            sx={{
              bgcolor: activeDropCol === col.id ? 'rgba(96, 165, 250, 0.08)' : 'rgba(13, 17, 26, 0.4)',
              borderRadius: '32px',
              p: 3,
              minHeight: '600px',
              border: '2px solid',
              borderColor: activeDropCol === col.id ? tokens.secondaryMain : 'rgba(148, 163, 184, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                bgcolor: activeDropCol === col.id ? 'rgba(96, 165, 250, 0.1)' : 'rgba(13, 17, 26, 0.6)',
              }
            }}
          >
            {/* Column Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {col.icon}
                </Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                  {col.title}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => onAddTask?.(col.id)}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '8px',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <AddRounded fontSize="small" />
              </IconButton>
            </Box>

            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {columnTasks.length > 0 ? (
                columnTasks.map((task: Task) => {
                  const priorityColor = priorityColorMap[task.priority] || tokens.textSecondary;
                  return (
                    <Card
                      key={task.taskId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.taskId)}
                      onDragOver={(e) => handleDragOverTask(e, task.taskId)}
                      onDragLeave={() => setDraggedOverTaskId(null)}
                      onClick={() => onTaskClick?.(task)}
                      sx={{
                        p: 2.5,
                        cursor: 'grab',
                        bgcolor: draggedTaskId === task.taskId ? 'transparent' : 'rgba(18, 22, 32, 0.8)',
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: draggedOverTaskId === task.taskId ? tokens.secondaryMain : 'rgba(148, 163, 184, 0.1)',
                        opacity: draggedTaskId === task.taskId ? 0.4 : 1,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        '&:hover': { 
                          transform: 'translateY(-4px) scale(1.01)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                          borderColor: tokens.secondaryMain,
                          bgcolor: 'rgba(22, 28, 40, 1)'
                        },
                        '&:active': { cursor: 'grabbing' },
                        // Visual indicator for reordering
                        '&::before': draggedOverTaskId === task.taskId ? {
                          content: '""',
                          position: 'absolute',
                          top: -8,
                          left: 0,
                          right: 0,
                          height: 4,
                          bgcolor: tokens.secondaryMain,
                          borderRadius: '2px',
                          boxShadow: `0 0 10px ${tokens.secondaryMain}`,
                        } : {},
                      }}
                    >
                      {task.imageKey && (
                        <Box sx={{ width: '100%', height: 140, borderRadius: '16px', mb: 2, overflow: 'hidden', border: '1px solid', borderColor: 'rgba(255,255,255,0.05)' }}>
                          <S3Image 
                            imageKey={task.imageKey} 
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </Box>
                      )}
                      <Typography sx={{ fontWeight: 600, mb: 2, fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.4 }}>
                        {task.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip
                            label={task.priority.toUpperCase()}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: priorityColor,
                              bgcolor: `${priorityColor}1A`,
                              border: `1px solid ${priorityColor}33`,
                              borderRadius: '6px',
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                          {task.status === 'in-review' && role === 'manager' && (
                            <Chip
                              label="READY TO APPROVE"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: tokens.secondaryMain,
                                bgcolor: `${tokens.secondaryMain}1A`,
                                border: `1px solid ${tokens.secondaryMain}33`,
                                borderRadius: '6px',
                              }}
                            />
                          )}
                        </Stack>
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            bgcolor: tokens.bgElevated, 
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.7rem', 
                            fontWeight: 800,
                            color: tokens.textPrimary
                          }}
                        >
                          {task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : '?'}
                        </Avatar>
                      </Box>
                    </Card>
                  );
                })
              ) : (
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '2px dashed rgba(148, 163, 184, 0.1)',
                    borderRadius: '24px',
                    m: 0.5
                  }}
                >
                  <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem', fontStyle: 'italic' }}>
                    Drop tasks here
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
};
