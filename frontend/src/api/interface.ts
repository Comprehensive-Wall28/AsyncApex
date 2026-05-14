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

export interface Project {
    projectId: string;
    name: string;
    description: string;
    status: TaskStatus; // we still need to discuss this with the backend team
    deadline: Date; // we still need to discuss this with the backend team
    budget: number; // we still need to discuss this with the backend team
    managerId: string;
    createdAt: Date;
    updatedAt: Date;
};

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