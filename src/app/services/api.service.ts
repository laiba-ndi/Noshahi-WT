import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dashboard, Project, TeamWorkload, TimeEntry, User, WorkItem, Comment, RecentActivity } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Projects
    getProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.apiUrl}/projects`);
    }
    getProject(id: number): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
    }
    createProject(data: any): Observable<Project> {
        return this.http.post<Project>(`${this.apiUrl}/projects`, data);
    }
    updateProject(id: number, data: any): Observable<Project> {
        return this.http.put<Project>(`${this.apiUrl}/projects/${id}`, data);
    }
    deleteProject(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/projects/${id}`);
    }

    // Work Items
    getWorkItems(projectId?: number, status?: string, assigneeId?: number): Observable<WorkItem[]> {
        let params = new HttpParams();
        if (projectId) params = params.set('projectId', projectId);
        if (status) params = params.set('status', status);
        if (assigneeId) params = params.set('assigneeId', assigneeId);
        return this.http.get<WorkItem[]>(`${this.apiUrl}/workitems`, { params });
    }
    getWorkItem(id: number): Observable<WorkItem> {
        return this.http.get<WorkItem>(`${this.apiUrl}/workitems/${id}`);
    }
    createWorkItem(data: any): Observable<WorkItem> {
        return this.http.post<WorkItem>(`${this.apiUrl}/workitems`, data);
    }
    updateWorkItem(id: number, data: any): Observable<WorkItem> {
        return this.http.put<WorkItem>(`${this.apiUrl}/workitems/${id}`, data);
    }
    updateWorkItemStatus(id: number, status: string, order?: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/workitems/${id}/status`, { status, order });
    }
    deleteWorkItem(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/workitems/${id}`);
    }

    // Comments
    getComments(workItemId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}/workitems/${workItemId}/comments`);
    }
    addComment(workItemId: number, content: string): Observable<Comment> {
        return this.http.post<Comment>(`${this.apiUrl}/workitems/${workItemId}/comments`, { content });
    }

    // Activity
    getActivity(workItemId: number): Observable<RecentActivity[]> {
        return this.http.get<RecentActivity[]>(`${this.apiUrl}/workitems/${workItemId}/activity`);
    }

    // Time Tracking
    startTimer(workItemId?: number, description?: string): Observable<TimeEntry> {
        return this.http.post<TimeEntry>(`${this.apiUrl}/timetracking/start`, { workItemId, description });
    }
    stopTimer(timeEntryId: number): Observable<TimeEntry> {
        return this.http.post<TimeEntry>(`${this.apiUrl}/timetracking/stop`, { timeEntryId });
    }
    logManualTime(data: any): Observable<TimeEntry> {
        return this.http.post<TimeEntry>(`${this.apiUrl}/timetracking/manual`, data);
    }
    getTimeEntries(userId?: number, workItemId?: number, from?: string, to?: string): Observable<TimeEntry[]> {
        let params = new HttpParams();
        if (userId) params = params.set('userId', userId);
        if (workItemId) params = params.set('workItemId', workItemId);
        if (from) params = params.set('from', from);
        if (to) params = params.set('to', to);
        return this.http.get<TimeEntry[]>(`${this.apiUrl}/timetracking/entries`, { params });
    }
    getRunningTimer(): Observable<TimeEntry | null> {
        return this.http.get<TimeEntry | null>(`${this.apiUrl}/timetracking/running`);
    }
    deleteTimeEntry(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/timetracking/${id}`);
    }
    uploadScreenshot(timeEntryId: number, screenshotData: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/timetracking/screenshot`, { timeEntryId, screenshotData });
    }
    getScreenshots(timeEntryId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/timetracking/screenshot/${timeEntryId}`);
    }

    // Notifications
    getNotifications(onlyUnread: boolean = true): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/notifications`, { params: { onlyUnread } });
    }
    markNotificationAsRead(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/notifications/${id}/read`, {});
    }

    // Messages
    getRecentMessages(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/messages`);
    }
    getConversation(otherUserId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/messages/${otherUserId}`);
    }
    sendMessage(receiverId: number, content: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/messages`, { receiverId, content });
    }

    // Reports
    getDashboard(): Observable<Dashboard> {
        return this.http.get<Dashboard>(`${this.apiUrl}/reports/dashboard`);
    }
    getTeamWorkload(): Observable<TeamWorkload[]> {
        return this.http.get<TeamWorkload[]>(`${this.apiUrl}/reports/team-workload`);
    }

    // Users
    registerUser(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, data);
    }
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }
    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    }
    updateUser(id: number, data: any): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${id}`, data);
    }
    toggleUserActive(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/users/${id}/toggle-active`, {});
    }
    changeUserRole(id: number, role: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/users/${id}/role`, { role });
    }

    // Drive
    getDriveFiles(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/drive`);
    }
    uploadDriveFile(formData: FormData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/drive/upload`, formData);
    }
    downloadDriveFile(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/drive/download/${id}`, { responseType: 'blob' });
    }
    viewDriveFile(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/drive/view/${id}`, { responseType: 'blob' });
    }
    deleteDriveFile(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/drive/${id}`);
    }
}
