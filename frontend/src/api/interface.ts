export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    taskId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
    teamId?: string;
    projectId?: string;
    deadline?: Date | string;
    imageKey?: string;
}

export interface ActivityLog {
    taskId: string;
    timestamp: string;
    changedBy: string;
    userName?: string;
    oldStatus: TaskStatus;
    newStatus: TaskStatus;
}

export interface Project {
    projectId: string;  // was 'id'
    name: string;
    description: string;
    managerId: string;
    teamIds: string[];
    createdAt: Date;
    updatedAt: Date;
    status: 'todo' | 'in-progress' | 'in-review' | 'done';
}

export interface Team {
    teamId: string;
    name: string;
    description: string;
    createdAt: Date;
};

export interface User {
    userId: string;
    name: string;
    email: string;
    role: 'employee' | 'manager';
    teamId?: string;
    teamName?: string;
}

export interface Comment {
    commentId: string;
    taskId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
}

export interface TeamMetric {
    teamName: string;
    avgTimeToClose: number;
}

export interface StatusStats {
    status: string;
    timestamp: string;
    analytics: {
        totalTasks: number;
        closedTasks: number;
        teamMetrics: TeamMetric[];
    }
}