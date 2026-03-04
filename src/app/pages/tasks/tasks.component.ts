import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { WorkItem } from '../../models/interfaces';

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tasks-page animate-fade-in">
      <div class="page-header">
        <div>
          <h1>My Tasks</h1>
          <p class="text-muted">Tasks assigned to you</p>
        </div>
      </div>

      @if (loading) {
        <div class="page-loader"><div class="spinner spinner-lg"></div></div>
      } @else {
        <div class="task-filters">
          <button class="filter-btn" [class.active]="filter === 'all'" (click)="filter = 'all'">All ({{ tasks.length }})</button>
          <button class="filter-btn" [class.active]="filter === 'Todo'" (click)="filter = 'Todo'">Todo ({{ countByStatus('Todo') }})</button>
          <button class="filter-btn" [class.active]="filter === 'InProgress'" (click)="filter = 'InProgress'">In Progress ({{ countByStatus('InProgress') }})</button>
          <button class="filter-btn" [class.active]="filter === 'InReview'" (click)="filter = 'InReview'">In Review ({{ countByStatus('InReview') }})</button>
          <button class="filter-btn" [class.active]="filter === 'Done'" (click)="filter = 'Done'">Done ({{ countByStatus('Done') }})</button>
        </div>

        <div class="task-list">
          @for (t of filteredTasks(); track t.id) {
            <div class="task-row glass-card">
              <div class="task-status-dot" [style.background]="getStatusColor(t.status)"></div>
              <div class="task-info">
                <div class="task-row-top">
                  <span class="task-key-tag">{{ t.itemKey }}</span>
                  <span class="badge badge-sm" [class]="'badge-' + t.type.toLowerCase()">{{ t.type }}</span>
                </div>
                <div class="task-row-title">{{ t.title }}</div>
                <div class="task-row-meta">
                  <span>{{ t.projectName }}</span>
                  @if (t.dueDate) {
                    <span>· Due {{ t.dueDate | date:'mediumDate' }}</span>
                  }
                  @if (t.estimatedHours) {
                    <span>· Est. {{ t.estimatedHours }}h</span>
                  }
                </div>
              </div>
              <div class="task-right">
                <span class="badge" [class]="'badge-' + t.priority.toLowerCase()">{{ t.priority }}</span>
                <span class="badge" [class]="'badge-' + t.status.toLowerCase()">{{ t.status === 'InProgress' ? 'In Progress' : t.status === 'InReview' ? 'In Review' : t.status }}</span>
              </div>
            </div>
          }
          @if (filteredTasks().length === 0) {
            <div class="empty-state" style="padding:40px">
              <p>No tasks found</p>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .page-header { margin-bottom: 20px; }
    .page-header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .task-filters {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      background: var(--bg-glass);
      border-radius: var(--radius-lg);
      padding: 4px;
      width: fit-content;
    }
    .filter-btn {
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .filter-btn:hover { color: var(--text-primary); }
    .filter-btn.active { background: var(--primary-subtle); color: var(--primary-light); }
    .task-list { display: flex; flex-direction: column; gap: 6px; }
    .task-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      cursor: pointer;
    }
    .task-row:hover { background: var(--bg-card-hover); }
    .task-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .task-info { flex: 1; min-width: 0; }
    .task-row-top { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
    .task-key-tag { font-size: 11px; font-weight: 600; color: var(--text-tertiary); }
    .task-row-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .task-row-meta { font-size: 12px; color: var(--text-tertiary); }
    .task-right { display: flex; gap: 8px; flex-shrink: 0; }
  `]
})
export class TasksComponent implements OnInit {
    tasks: WorkItem[] = [];
    loading = true;
    filter = 'all';

    constructor(private api: ApiService, private auth: AuthService) { }

    ngOnInit() {
        const userId = this.auth.getCurrentUser()?.id;
        this.api.getWorkItems(undefined, undefined, userId).subscribe({
            next: (items) => { this.tasks = items; this.loading = false; },
            error: () => this.loading = false
        });
    }

    filteredTasks(): WorkItem[] {
        if (this.filter === 'all') return this.tasks;
        return this.tasks.filter(t => t.status === this.filter);
    }

    countByStatus(status: string): number {
        return this.tasks.filter(t => t.status === status).length;
    }

    getStatusColor(status: string): string {
        const colors: Record<string, string> = { Todo: '#94a3b8', InProgress: '#3b82f6', InReview: '#f59e0b', Done: '#10b981' };
        return colors[status] || '#94a3b8';
    }
}
