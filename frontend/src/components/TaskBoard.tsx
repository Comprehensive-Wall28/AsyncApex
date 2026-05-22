import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Skeleton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  AddRounded,
  RadioButtonUncheckedRounded,
  AccessTimeRounded,
  CheckCircleRounded,
  TuneRounded,
  PlayArrowRounded,
  SendRounded,
  CloseRounded
} from '@mui/icons-material';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api';
import type { Task, User, Team } from '../api/interface';
import { tokens } from '../theme/theme';

interface TaskBoardProps {
  teamId?: string;
  projectId?: string;
  searchQuery?: string;
  role: 'manager' | 'employee';
  refreshKey?: number;
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: Task['status']) => void;
  users?: User[];
  teams?: Team[];
}

const priorityColorMap: Record<string, string> = {
  high: tokens.errorMain,
  medium: tokens.warningMain,
  low: tokens.successMain,
};

interface SortableTaskCardProps {
  task: Task;
  role: 'manager' | 'employee';
  onClick: () => void;
  onStart?: (taskId: string) => void;
  onSubmit?: (taskId: string) => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  users: User[];
  teams: Team[];
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, role, onClick, onStart, onSubmit, onApprove, onReject, users, teams }) => {
  const isDragDisabled = role === 'employee' && (task.status === 'in-review' || task.status === 'done');

  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!task.imageKey) return;
    api.s3.getPresignedUrl(task.imageKey).then(({ url }) => setThumbUrl(url)).catch(() => {});
  }, [task.imageKey]);

  const assignee = task.assigneeId ? users.find(u => u.userId === task.assigneeId) : undefined;
  const team = task.teamId ? teams.find(t => t.teamId === task.teamId) : undefined;

  const displayInitials = assignee
    ? assignee.name.substring(0, 2).toUpperCase()
    : (task.assigneeId
        ? task.assigneeId.substring(0, 2).toUpperCase()
        : (team ? team.name.substring(0, 2).toUpperCase() : '?'));

  const displayTitle = assignee
    ? `Assignee: ${assignee.name}`
    : (team ? `Team: ${team.name}` : 'Unassigned');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.taskId,
    data: { task },
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const priorityColor = priorityColorMap[task.priority] || tokens.textSecondary;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (transform) return;
        onClick();
      }}
      sx={{
        p: 2.5,
        cursor: isDragDisabled ? 'default' : 'grab',
        bgcolor: 'rgba(18, 22, 32, 0.8)',
        borderRadius: '24px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          transform: isDragDisabled ? 'none' : 'translateY(-4px) scale(1.01)',
          boxShadow: isDragDisabled ? 'none' : '0 20px 40px rgba(0,0,0,0.5)',
          borderColor: isDragDisabled ? 'rgba(148, 163, 184, 0.1)' : tokens.secondaryMain,
          bgcolor: isDragDisabled ? 'rgba(18, 22, 32, 0.8)' : 'rgba(22, 28, 40, 1)'
        },
        '&:active': { cursor: isDragDisabled ? 'default' : 'grabbing' },
      }}
    >
      {thumbUrl && (
        <Box
          component="img"
          src={thumbUrl}
          alt={task.title}
          sx={{
            width: '100%',
            height: 140,
            objectFit: 'cover',
            borderRadius: '16px',
            mb: 2,
            display: 'block',
          }}
        />
      )}

      <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.4 }}>
        {task.title}
      </Typography>

      {task.deadline && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, color: 'text.secondary' }}>
          <AccessTimeRounded sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
        </Stack>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: assignee ? tokens.bgElevated : 'rgba(168, 85, 247, 0.2)',
            border: assignee ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(168, 85, 247, 0.4)',
            fontSize: '0.7rem',
            fontWeight: 800,
            color: assignee ? tokens.textPrimary : 'rgb(216, 180, 254)'
          }}
          title={displayTitle}
        >
          {displayInitials}
        </Avatar>
      </Box>

      <Stack spacing={1} sx={{ mt: 1 }}>
        {task.status === 'todo' && role === 'employee' && (
          <Button
            fullWidth
            size="small"
            variant="contained"
            startIcon={<PlayArrowRounded />}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onStart?.(task.taskId);
            }}
            sx={{
              borderRadius: '12px',
              bgcolor: tokens.successMain,
              '&:hover': { bgcolor: tokens.successMain, opacity: 0.9 }
            }}
          >
            Start
          </Button>
        )}
        {task.status === 'in-progress' && (
          <Button
            fullWidth
            size="small"
            variant="contained"
            startIcon={<SendRounded />}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSubmit?.(task.taskId);
            }}
            sx={{
              borderRadius: '12px',
              bgcolor: tokens.secondaryMain,
              '&:hover': { bgcolor: tokens.secondaryMain, opacity: 0.9 }
            }}
          >
            Submit
          </Button>
        )}
        {task.status === 'in-review' && role === 'manager' && (
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              color="success"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onApprove?.(task.taskId);
              }}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Approve
            </Button>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              color="error"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onReject?.(task.taskId);
              }}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Reject
            </Button>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

interface TaskColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  role: 'manager' | 'employee';
  onAddTask?: (status: Task['status']) => void;
  onTaskClick?: (task: Task) => void;
  onStartTask: (taskId: string) => void;
  onSubmitTask: (taskId: string) => void;
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
  users: User[];
  teams: Team[];
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  id, title, icon, tasks, role, onAddTask, onTaskClick, onStartTask, onSubmitTask, onApproveTask, onRejectTask, users, teams
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        bgcolor: isOver ? 'rgba(96, 165, 250, 0.08)' : 'rgba(13, 17, 26, 0.4)',
        borderRadius: '32px',
        p: 3,
        minHeight: '600px',
        border: '2px solid',
        borderColor: isOver ? tokens.secondaryMain : 'rgba(148, 163, 184, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
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
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
        </Box>
        {role === 'manager' && (
          <IconButton
            size="small"
            onClick={() => onAddTask?.(id as Task['status'])}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <AddRounded fontSize="small" />
          </IconButton>
        )}
      </Box>

      <SortableContext
        id={id}
        items={tasks.map(t => t.taskId)}
        strategy={verticalListSortingStrategy}
      >
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          {tasks.length > 0 ? (
            tasks.map((task: Task) => (
              <SortableTaskCard
                key={task.taskId}
                task={task}
                role={role}
                onClick={() => onTaskClick?.(task)}
                onStart={onStartTask}
                onSubmit={onSubmitTask}
                onApprove={onApproveTask}
                onReject={onRejectTask}
                users={users}
                teams={teams}
              />
            ))
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed rgba(148, 163, 184, 0.1)',
                borderRadius: '24px',
                m: 0.5,
                bgcolor: isOver ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
              }}
            >
              <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Drop tasks here
              </Typography>
            </Box>
          )}
        </Stack>
      </SortableContext>
    </Box>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({
  teamId,
  projectId,
  searchQuery,
  role,
  refreshKey,
  onTaskClick,
  onAddTask,
  users = [],
  teams = []
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const startStatusRef = useRef<Task['status'] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const me = await api.users.getMe() as any;

      const data =
        me.role === 'manager'
          ? await api.tasks.getAll(teamId ? { teamId } : undefined)
          : await api.tasks.getAllByUser(me.userId);

      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      const fail = 'Failed to fetch tasks ';
      toast.error(fail + err);
      console.error(fail, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [teamId, refreshKey]);

  const handleStartTask = async (taskId: string) => {
    try {
      await api.tasks.start(taskId);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: 'in-progress' } : t));
    } catch (error) {
      const fail = 'Failed to start task ';
      toast.error(fail + error)
      console.error(fail, error);
      fetchTasks();
    }
  };

  const handleSubmitTask = async (taskId: string) => {
    try {
      await api.tasks.submit(taskId);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: 'in-review' } : t));
    } catch (error) {
      const fail = 'Failed to submit task '
      toast.error(fail + error)
      console.error(fail, error);
      fetchTasks();
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      if (role === 'manager') {
        await api.tasks.approve(taskId);
        setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: 'done' } : t));
      }
    } catch (error) {
      const fail = 'Failed to approve task '
      toast.error(fail + error)
      console.error(fail, error);
      fetchTasks();
    }
  };

  const handleRejectTask = (taskId: string) => {
    setRejectingTaskId(taskId);
    setRejectionReason('');
  };

  const confirmRejection = async () => {
    if (!rejectingTaskId || !rejectionReason.trim()) return;

    try {
      setIsRejecting(true);
      // 1. Add comment with reason
      await api.comments.create({
        taskId: rejectingTaskId,
        content: `Rejected: ${rejectionReason}`
      });
      // 2. Call reject API
      await api.tasks.reject(rejectingTaskId);

      setTasks(prev => prev.map(t => t.taskId === rejectingTaskId ? { ...t, status: 'in-progress' } : t));
      setRejectingTaskId(null);
    } catch (error) {
      const fail = 'Failed to reject task '
      toast.error(fail + error)
      console.error(fail, error);
      fetchTasks();
    } finally {
      setIsRejecting(false);
    }
  };

  const findContainer = (id: string) => {
    if (['todo', 'in-progress', 'in-review', 'done'].includes(id)) {
      return id;
    }
    const task = tasks.find(t => t.taskId === id);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.taskId === active.id);
    if (task) {
      setActiveTask(task);
      startStatusRef.current = task.status;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return; // 👈 add this

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    // Enforce employee restrictions in drag over
    if (role === 'employee') {
      const allowedTransitions: Record<string, string> = {
        'todo': 'in-progress',
        'in-progress': 'in-review',
      };
      if (allowedTransitions[activeContainer] !== overContainer) {
        return;
      }
    }

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.taskId === activeId);

      if (activeIndex === -1) return prev; // 👈 add this — task not found, don't update

      const overIndex = prev.findIndex((t) => t.taskId === overId);

      const newIndex = ['todo', 'in-progress', 'in-review', 'done'].includes(overId)
        ? prev.length
        : overIndex >= 0 ? overIndex : prev.length;

      // 👇 Don't update if status is already correct
      if (prev[activeIndex].status === overContainer) return prev;

      const updatedTask = { ...prev[activeIndex], status: overContainer as Task['status'] };
      const newTasks = [...prev];
      newTasks.splice(activeIndex, 1);
      newTasks.splice(newIndex, 0, updatedTask);
      return newTasks;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      // Revert if dropped outside
      if (startStatusRef.current) fetchTasks();
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const overContainer = findContainer(overId);
    const initialStatus = startStatusRef.current;

    if (initialStatus && overContainer && initialStatus !== overContainer) {
      // Enforce employee restrictions in drag end
      if (role === 'employee') {
        const allowedTransitions: Record<string, string> = {
          'todo': 'in-progress',
          'in-progress': 'in-review',
        };
        if (allowedTransitions[initialStatus] !== overContainer) {
          toast.error('Invalid status transition for team members');
          fetchTasks();
          startStatusRef.current = null;
          return;
        }
      }

      // Sync with API
      try {
        console.log("Meow")
        if (initialStatus === 'todo' && overContainer === 'in-progress') {
          await api.tasks.start(activeId);
        } else if (initialStatus === 'in-progress' && overContainer === 'in-review') {
          await api.tasks.submit(activeId);
        } else if (initialStatus === 'in-review' && overContainer === 'done' && role === 'manager') {
          await api.tasks.approve(activeId);
        } else if (initialStatus === 'in-review' && overContainer === 'in-progress' && role === 'manager') {
          handleRejectTask(activeId); // Prompt for reason even on drag
        } else {
          await api.tasks.update(activeId, { status: overContainer });
        }
      } catch (error) {
        const fail = 'Failed to sync status '
        toast.error(fail + error)
        console.error(fail, error);
        fetchTasks();
      }
    } else if (active.id !== over.id) {
      // Reordering within same column
      const oldIndex = tasks.findIndex((t) => t.taskId === activeId);
      const newIndex = tasks.findIndex((t) => t.taskId === overId);
      setTasks((items) => arrayMove(items, oldIndex, newIndex));
    }

    startStatusRef.current = null;
  };

  const columns = [
    { id: 'todo' as const, title: 'To Do', icon: <RadioButtonUncheckedRounded sx={{ color: tokens.textSecondary }} /> },
    { id: 'in-progress' as const, title: 'In Progress', icon: <AccessTimeRounded sx={{ color: tokens.warningMain }} /> },
    { id: 'in-review' as const, title: 'In Review', icon: <TuneRounded sx={{ color: tokens.secondaryMain }} /> },
    { id: 'done' as const, title: 'Done', icon: <CheckCircleRounded sx={{ color: tokens.successMain }} /> },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
        {[1, 2, 3, 4].map((col) => (
          <Box key={col} sx={{ bgcolor: 'rgba(13, 17, 26, 0.4)', borderRadius: '32px', p: 3, minHeight: '600px', border: '2px solid rgba(148, 163, 184, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>
            <Stack spacing={2}>
              {[1, 2, 3].map((card) => (
                <Box key={card} sx={{ p: 2.5, bgcolor: 'rgba(18, 22, 32, 0.8)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: '16px', mb: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" width="40%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    );
  }

  const filteredTasks = tasks.filter(t => {
    // Filter by teamId if provided
    if (teamId && t.teamId !== teamId) return false;

    // Filter by projectId if provided
    if (projectId && t.projectId !== projectId) return false;

    // Filter by searchQuery if provided
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  });

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
          {columns.map(col => (
            <TaskColumn
              key={col.id}
              id={col.id}
              title={col.title}
              icon={col.icon}
              tasks={filteredTasks.filter(t => t.status === col.id)}
              role={role}
              onAddTask={onAddTask}
              onTaskClick={onTaskClick}
              onStartTask={handleStartTask}
              onSubmitTask={handleSubmitTask}
              onApproveTask={handleApproveTask}
              onRejectTask={handleRejectTask}
              users={users}
              teams={teams}
            />
          ))}
        </Box>
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeTask ? (
            <SortableTaskCard
              task={activeTask}
              role={role}
              onClick={() => { }}
              users={users}
              teams={teams}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Rejection Dialog */}
      <Dialog
        open={!!rejectingTaskId}
        onClose={() => setRejectingTaskId(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: 'background.paper',
              minWidth: 400
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Reject Task
          <IconButton onClick={() => setRejectingTaskId(null)} size="small">
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Please provide a reason for rejecting this task. This will be posted as a comment.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Feedback for the assignee..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRejectingTaskId(null)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim() || isRejecting}
            onClick={confirmRejection}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {isRejecting ? 'Rejecting...' : 'Reject Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
