export interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
    jobTitle?: string;
    department?: string;
    isActive: boolean;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    key: string;
    status: string;
    color: string;
    ownerId: number;
    ownerName: string;
    createdAt: string;
    totalItems: number;
    doneItems: number;
}

export interface WorkItem {
    id: number;
    title: string;
    description?: string;
    type: string;
    status: string;
    priority: string;
    itemKey?: string;
    projectId: number;
    projectName: string;
    assigneeId?: number;
    assigneeName?: string;
    reporterId: number;
    reporterName: string;
    estimatedHours?: number;
    totalTimeLogged: number;
    dueDate?: string;
    order: number;
    commentCount: number;
    createdAt: string;
    updatedAt?: string;
}

export interface TimeEntry {
    id: number;
    workItemId?: number;
    workItemTitle?: string;
    userId: number;
    userName: string;
    description?: string;
    startTime: string;
    endTime?: string;
    duration: number;
    isRunning: boolean;
    createdAt: string;
}

export interface Comment {
    id: number;
    workItemId: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
}

export interface Dashboard {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalHoursThisWeek: number;
    projectSummaries: ProjectSummary[];
    recentActivities: RecentActivity[];
}

export interface ProjectSummary {
    projectId: number;
    projectName: string;
    totalItems: number;
    todoCount: number;
    inProgressCount: number;
    inReviewCount: number;
    doneCount: number;
    totalHoursLogged: number;
}

export interface TeamWorkload {
    userId: number;
    userName: string;
    avatar?: string;
    assignedItems: number;
    completedItems: number;
    hoursLoggedThisWeek: number;
}

export interface RecentActivity {
    id: number;
    action: string;
    details?: string;
    userName: string;
    workItemTitle?: string;
    createdAt: string;
}
