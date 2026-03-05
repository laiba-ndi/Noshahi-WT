import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Dashboard } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="text-muted">Welcome back, {{ userName }}! Here's your workspace overview.</p>
        </div>
      </div>

      @if (loading) {
        <div class="page-loader"><div class="spinner spinner-lg"></div></div>
      } @else if (data) {
        <!-- KPI Cards -->
        <div class="kpi-wrapper">
          <div class="kpi-grid">
            <div class="kpi-card" style="--accent: #6366f1">
              <div class="kpi-icon" style="background: rgba(99,102,241,0.15)">
                <svg width="22" height="22" fill="none" stroke="#6366f1" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
              </div>
              <div class="kpi-data">
                <div class="kpi-value">{{ data.totalProjects || 0 }}</div>
                <div class="kpi-label">Active Projects</div>
              </div>
            </div>
            <div class="kpi-card" style="--accent: #3b82f6">
              <div class="kpi-icon" style="background: rgba(59,130,246,0.15)">
                <svg width="22" height="22" fill="none" stroke="#3b82f6" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <div class="kpi-data">
                <div class="kpi-value">{{ data.totalTasks || 0 }}</div>
                <div class="kpi-label">Total Tasks</div>
              </div>
            </div>
            <div class="kpi-card" style="--accent: #10b981">
              <div class="kpi-icon" style="background: rgba(16,185,129,0.15)">
                <svg width="22" height="22" fill="none" stroke="#10b981" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div class="kpi-data">
                <div class="kpi-value">{{ data.completedTasks || 0 }}</div>
                <div class="kpi-label">Completed</div>
              </div>
            </div>
            <div class="kpi-card" style="--accent: #f59e0b">
              <div class="kpi-icon" style="background: rgba(245,158,11,0.15)">
                <svg width="22" height="22" fill="none" stroke="#f59e0b" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              </div>
              <div class="kpi-data">
                <div class="kpi-value">{{ (data.totalHoursThisWeek || 0) | number:'1.0-1' }}h</div>
                <div class="kpi-label">Hours This Week</div>
              </div>
            </div>
          </div>
        </div>
 
        <div class="dashboard-grid">
          <!-- Project Progress -->
          <div class="glass-card section-card">
            <div class="card-header">
              <h3>Project Progress</h3>
              <a routerLink="/projects" class="view-all">View All →</a>
            </div>
            <div class="project-list">
              @for (p of data.projectSummaries || []; track p.projectId) {
                <div class="project-item">
                  <div class="project-info">
                    <div class="project-name">{{ p.projectName }}</div>
                    <div class="project-stats text-muted text-sm">
                      {{ p.doneCount }}/{{ p.totalItems }} tasks · {{ p.totalHoursLogged | number:'1.0-1' }}h logged
                    </div>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="getProgress(p)"></div>
                    </div>
                    <span class="progress-label">{{ getProgress(p) | number:'1.0-0' }}%</span>
                  </div>
                </div>
              }
              @if (!(data.projectSummaries?.length)) {
                <div class="empty-state">No projects yet</div>
              }
            </div>
          </div>
 
          <!-- Task Distribution -->
          <div class="glass-card section-card">
            <div class="card-header">
              <h3>Task Distribution</h3>
            </div>
            <div class="status-bars">
              @for (p of data.projectSummaries || []; track p.projectId) {
                <div class="status-row">
                  <div class="status-label">{{ p.projectName }}</div>
                  <div class="status-bar-group">
                    @if (p.todoCount) {
                      <div class="status-seg todo" [style.flex]="p.todoCount" title="Todo: {{p.todoCount}}"></div>
                    }
                    @if (p.inProgressCount) {
                      <div class="status-seg inprogress" [style.flex]="p.inProgressCount" title="In Progress: {{p.inProgressCount}}"></div>
                    }
                    @if (p.inReviewCount) {
                      <div class="status-seg inreview" [style.flex]="p.inReviewCount" title="In Review: {{p.inReviewCount}}"></div>
                    }
                    @if (p.doneCount) {
                      <div class="status-seg done" [style.flex]="p.doneCount" title="Done: {{p.doneCount}}"></div>
                    }
                  </div>
                </div>
              }
              <div class="status-legend">
                <span><i style="background:#94a3b8"></i> Todo</span>
                <span><i style="background:#3b82f6"></i> In Progress</span>
                <span><i style="background:#f59e0b"></i> In Review</span>
                <span><i style="background:#10b981"></i> Done</span>
              </div>
            </div>
          </div>
 
          <!-- Recent Activity -->
          <div class="glass-card section-card activity-card">
            <div class="card-header">
              <h3>Recent Activity</h3>
            </div>
            <div class="activity-feed">
              @for (a of data.recentActivities || []; track a.id) {
                <div class="activity-item">
                  <div class="activity-icon" [class]="'action-' + (a.action?.toLowerCase() || '')">
                    {{ getActionIcon(a.action) }}
                  </div>
                  <div class="activity-content">
                    <div><strong>{{ a.userName }}</strong> {{ a.details || a.action }}</div>
                    @if (a.workItemTitle) {
                      <div class="text-muted text-sm">{{ a.workItemTitle }}</div>
                    }
                  </div>
                  <div class="activity-time text-muted text-xs">{{ timeAgo(a.createdAt) }}</div>
                </div>
              }
              @if (!(data.recentActivities.length)) {
                <div class="empty-state">No recent activity</div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all var(--transition-base);
      backdrop-filter: blur(20px);
    }
    .kpi-card:hover {
      border-color: var(--accent);
      box-shadow: 0 0 20px rgba(99,102,241,0.1);
      transform: translateY(-2px);
    }
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-value { font-size: 28px; font-weight: 800; line-height: 1; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .section-card { padding: 20px; }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .card-header h3 { font-size: 15px; font-weight: 700; }
    .view-all {
      font-size: 12px;
      color: var(--primary-light);
      text-decoration: none;
      font-weight: 500;
    }
    .view-all:hover { color: var(--primary); }

    .project-list { display: flex; flex-direction: column; gap: 14px; }
    .project-item { }
    .project-name { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
    .project-stats { margin-bottom: 6px; }
    .progress-bar-container { display: flex; align-items: center; gap: 10px; }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--bg-glass);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      transition: width 0.5s ease;
    }
    .progress-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); min-width: 35px; text-align: right; }

    .status-bars { display: flex; flex-direction: column; gap: 12px; }
    .status-row { }
    .status-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
    .status-bar-group { display: flex; height: 12px; border-radius: var(--radius-full); overflow: hidden; gap: 2px; }
    .status-seg { border-radius: var(--radius-full); min-width: 8px; transition: all 0.3s ease; cursor: pointer; }
    .status-seg:hover { opacity: 0.8; transform: scaleY(1.2); }
    .status-seg.todo { background: #94a3b8; }
    .status-seg.inprogress { background: #3b82f6; }
    .status-seg.inreview { background: #f59e0b; }
    .status-seg.done { background: #10b981; }
    .status-legend { display: flex; gap: 16px; margin-top: 12px; }
    .status-legend span { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-tertiary); }
    .status-legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

    .activity-card { grid-column: 1 / -1; }
    .activity-feed { display: flex; flex-direction: column; gap: 2px; max-height: 300px; overflow-y: auto; }
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
    }
    .activity-item:hover { background: var(--bg-glass); }
    .activity-icon {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }
    .action-created { background: rgba(16,185,129,0.15); }
    .action-statuschanged { background: rgba(59,130,246,0.15); }
    .action-assigned { background: rgba(139,92,246,0.15); }
    .action-commented { background: rgba(245,158,11,0.15); }
    .action-timelogged { background: rgba(6,182,212,0.15); }
    .activity-content { flex: 1; font-size: 13px; line-height: 1.4; }
    .activity-content strong { font-weight: 600; }
    .activity-time { white-space: nowrap; }
    .empty-state { text-align: center; padding: 24px; color: var(--text-tertiary); font-size: 13px; }

    @media (max-width: 1024px) {
      .kpi-wrapper {
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .kpi-grid {
        grid-template-columns: repeat(4, 200px);
        gap: 12px;
        width: fit-content;
      }
      .dashboard-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .page-header h1 { font-size: 20px; }
      .kpi-card { padding: 16px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  data: Dashboard | null = null;
  loading = true;
  userName = '';

  constructor(private api: ApiService, private auth: AuthService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.userName = this.auth.getCurrentUser()?.fullName?.split(' ')[0] || '';
    this.api.getDashboard().subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getProgress(p: any): number {
    return p.totalItems ? (p.doneCount / p.totalItems) * 100 : 0;
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = { Created: '✦', StatusChanged: '→', Assigned: '👤', Commented: '💬', TimeLogged: '⏱' };
    return icons[action] || '•';
  }

  timeAgo(date: string): string {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}
