import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { WorkItem, Project, User } from '../../models/interfaces';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="board-page animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Kanban Board</h1>
          <p class="text-muted">Drag tasks across columns to update status</p>
        </div>
        <div class="header-actions">
          <select class="form-control" [(ngModel)]="selectedProjectId" (ngModelChange)="filterByProject()">
            <option [ngValue]="0">All Projects</option>
            @for (p of projects; track p.id) {
              <option [ngValue]="p.id">{{ p.name }}</option>
            }
          </select>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            New Task
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="page-loader"><div class="spinner spinner-lg"></div></div>
      } @else {
        <div class="board">
          @for (col of columns; track col.id) {
            <div class="board-column"
              (dragover)="onDragOver($event)"
              (drop)="onDrop($event, col.id)">
              <div class="column-header">
                <div class="column-title">
                  <span class="column-dot" [style.background]="col.color"></span>
                  {{ col.label }}
                </div>
                <span class="column-count">{{ getColumnItems(col.id).length }}</span>
              </div>
              <div class="column-body">
                @for (item of getColumnItems(col.id); track item.id) {
                  <div class="task-card glass-card"
                    draggable="true"
                    (dragstart)="onDragStart($event, item)"
                    (click)="openDetail(item)">
                    <div class="task-top">
                      <span class="task-key">{{ item.itemKey }}</span>
                      <span class="badge" [class]="'badge-' + item.type.toLowerCase()">{{ item.type }}</span>
                    </div>
                    <div class="task-title">{{ item.title }}</div>
                    <div class="task-bottom">
                      <span class="badge badge-sm" [class]="'badge-' + item.priority.toLowerCase()">{{ item.priority }}</span>
                      <div class="task-meta">
                        @if (item.assigneeName) {
                          <div class="avatar avatar-sm" [style.background]="getAvatarColor(item.assigneeName)" title="{{ item.assigneeName }}">
                            {{ getInitials(item.assigneeName) }}
                          </div>
                        }
                        @if (item.commentCount > 0) {
                          <span class="meta-icon" title="Comments">💬 {{ item.commentCount }}</span>
                        }
                      </div>
                    </div>
                  </div>
                }
                @if (getColumnItems(col.id).length === 0) {
                  <div class="column-empty">Drop tasks here</div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Create Task Modal -->
      @if (showCreateModal) {
        <div class="modal-overlay" (click)="showCreateModal = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Create Task</h2>
              <button class="btn-icon" (click)="showCreateModal = false">✕</button>
            </div>
            <form (ngSubmit)="createTask()">
              <div class="form-group" style="margin-bottom:14px">
                <label>Title</label>
                <input class="form-control" [(ngModel)]="newTask.title" name="title" placeholder="What needs to be done?" required>
              </div>
              <div class="form-group" style="margin-bottom:14px">
                <label>Description</label>
                <textarea class="form-control" [(ngModel)]="newTask.description" name="desc" placeholder="Add more details..."></textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
                <div class="form-group">
                  <label>Type</label>
                  <select class="form-control" [(ngModel)]="newTask.type" name="type">
                    <option>Task</option><option>Bug</option><option>Story</option><option>Epic</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Priority</label>
                  <select class="form-control" [(ngModel)]="newTask.priority" name="priority">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
                <div class="form-group">
                  <label>Project</label>
                  <select class="form-control" [(ngModel)]="newTask.projectId" name="project" required>
                    @for (p of projects; track p.id) {
                      <option [ngValue]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label>Assignee</label>
                  <select class="form-control" [(ngModel)]="newTask.assigneeId" name="assignee">
                    <option [ngValue]="null">Unassigned</option>
                    @if (!auth.isAdminOrManager()) {
                      <option [ngValue]="auth.getCurrentUser()?.id">{{ auth.getCurrentUser()?.fullName }}</option>
                    } @else {
                      @for (u of users; track u.id) {
                        <option [ngValue]="u.id">{{ u.fullName }}</option>
                      }
                    }
                  </select>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
                <div class="form-group">
                  <label>Estimated Hours</label>
                  <input type="number" class="form-control" [(ngModel)]="newTask.estimatedHours" name="hours" placeholder="0">
                </div>
                <div class="form-group">
                  <label>Due Date</label>
                  <input type="date" class="form-control" [(ngModel)]="newTask.dueDate" name="due">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="showCreateModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Task Detail Modal -->
      @if (selectedTask) {
        <div class="modal-overlay" (click)="selectedTask = null">
          <div class="modal-content detail-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <span class="task-key">{{ selectedTask.itemKey }}</span>
                <span class="badge" [class]="'badge-' + selectedTask.type.toLowerCase()" style="margin-left:8px">{{ selectedTask.type }}</span>
              </div>
              <button class="btn-icon" (click)="selectedTask = null">✕</button>
            </div>
            <h2 style="margin-bottom:16px">{{ selectedTask.title }}</h2>
            @if (selectedTask.description) {
              <p style="color:var(--text-secondary);margin-bottom:16px;font-size:13px;line-height:1.6">{{ selectedTask.description }}</p>
            }
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <select class="form-control" [ngModel]="selectedTask.status" (ngModelChange)="updateTaskStatus($event)">
                  <option value="Todo">Todo</option><option value="InProgress">In Progress</option>
                  <option value="InReview">In Review</option><option value="Done">Done</option>
                </select>
              </div>
              <div class="detail-item">
                <span class="detail-label">Priority</span>
                <span class="badge" [class]="'badge-' + selectedTask.priority.toLowerCase()">{{ selectedTask.priority }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Assignee</span>
                <span>{{ selectedTask.assigneeName || 'Unassigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Reporter</span>
                <span>{{ selectedTask.reporterName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Project</span>
                <span>{{ selectedTask.projectName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Time Logged</span>
                <span>{{ selectedTask.totalTimeLogged | number:'1.1-1' }}h</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .header-actions select { width: 200px; }

    .board {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 16px;
      height: calc(100vh - 180px);
    }
    .board-column {
      min-width: 280px;
      width: 280px;
      display: flex;
      flex-direction: column;
      background: rgba(255,255,255,0.02);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      flex-shrink: 0;
    }
    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
    }
    .column-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .column-dot { width: 10px; height: 10px; border-radius: 50%; }
    .column-count {
      font-size: 11px;
      font-weight: 700;
      background: var(--bg-glass);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      color: var(--text-secondary);
    }
    .column-body {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .column-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      font-size: 12px;
      border: 2px dashed var(--border);
      border-radius: var(--radius-md);
      margin: 4px;
      min-height: 60px;
    }

    .task-card {
      padding: 14px;
      cursor: grab;
      transition: all var(--transition-base);
    }
    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .task-card:active { cursor: grabbing; }
    .task-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .task-key { font-size: 11px; font-weight: 600; color: var(--text-tertiary); }
    .task-title { font-size: 13px; font-weight: 600; line-height: 1.4; margin-bottom: 10px; }
    .task-bottom { display: flex; justify-content: space-between; align-items: center; }
    .badge-sm { font-size: 10px; padding: 1px 6px; }
    .task-meta { display: flex; align-items: center; gap: 8px; }
    .meta-icon { font-size: 11px; color: var(--text-tertiary); }

    .detail-modal { max-width: 620px; }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 4px;
    }
    .detail-item { }
    .detail-label { display: block; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .detail-item select { padding: 6px 10px; font-size: 12px; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; }
      .header-actions { width: 100%; justify-content: space-between; gap: 8px; }
      .header-actions select { flex: 1; min-width: 0; }
      .board-column { min-width: 260px; width: 260px; }
    }
  `]
})
export class BoardComponent implements OnInit {
  items: WorkItem[] = [];
  projects: Project[] = [];
  users: User[] = [];
  loading = true;
  selectedProjectId = 0;
  showCreateModal = false;
  selectedTask: WorkItem | null = null;
  draggedItem: WorkItem | null = null;

  columns = [
    { id: 'Todo', label: 'To Do', color: '#94a3b8' },
    { id: 'InProgress', label: 'In Progress', color: '#3b82f6' },
    { id: 'InReview', label: 'In Review', color: '#f59e0b' },
    { id: 'Done', label: 'Done', color: '#10b981' }
  ];

  newTask: any = { title: '', description: '', type: 'Task', priority: 'Medium', projectId: null, assigneeId: null, estimatedHours: null, dueDate: null };

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) this.selectedProjectId = +params['projectId'];
      this.loadData();
    });
  }

  loadData() {
    this.api.getProjects().subscribe(p => {
      this.projects = p;
      if (!this.newTask.projectId && p.length) this.newTask.projectId = p[0].id;
      this.cdr.markForCheck();
    });
    this.api.getUsers().subscribe(u => {
      this.users = u;
      this.cdr.markForCheck();
    });
    this.loadItems();
  }

  loadItems() {
    this.api.getWorkItems(this.selectedProjectId || undefined).subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterByProject() { this.loadItems(); }

  getColumnItems(status: string): WorkItem[] {
    return this.items.filter(i => i.status === status).sort((a, b) => a.order - b.order);
  }

  onDragStart(event: DragEvent, item: WorkItem) {
    this.draggedItem = item;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.id.toString());
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDrop(event: DragEvent, status: string) {
    event.preventDefault();
    if (this.draggedItem && this.draggedItem.status !== status) {
      const oldStatus = this.draggedItem.status;
      this.draggedItem.status = status;
      this.api.updateWorkItemStatus(this.draggedItem.id, status).subscribe({
        next: () => {
          this.notification.success('Status Updated', `Task moved to ${status}`);
        },
        error: () => {
          if (this.draggedItem) this.draggedItem.status = oldStatus;
          this.cdr.markForCheck();
          this.notification.error('Update Failed', 'Could not update task status');
        }
      });
      this.cdr.markForCheck();
    }
    this.draggedItem = null;
  }

  createTask() {
    if (!this.auth.isAdminOrManager()) {
      // Employees default assign to self if not unassigned
      if (this.newTask.assigneeId !== null) {
        this.newTask.assigneeId = this.auth.getCurrentUser()?.id;
      }
    }

    this.api.createWorkItem(this.newTask).subscribe({
      next: (item) => {
        this.items.push(item);
        this.showCreateModal = false;
        this.newTask = { title: '', description: '', type: 'Task', priority: 'Medium', projectId: this.projects[0]?.id, assigneeId: null, estimatedHours: null, dueDate: null };
        this.cdr.markForCheck();
        this.notification.success('Task Created', `Successfully created ${item.itemKey}`);
      },
      error: () => {
        this.notification.error('Create Failed', 'Could not create task');
      }
    });
  }

  openDetail(item: WorkItem) { this.selectedTask = item; }

  updateTaskStatus(status: string) {
    if (this.selectedTask) {
      this.api.updateWorkItemStatus(this.selectedTask.id, status).subscribe(() => {
        this.notification.success('Status Updated', `Task is now ${status}`);
        this.cdr.markForCheck();
      });
      this.selectedTask.status = status;
      this.cdr.markForCheck();
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
