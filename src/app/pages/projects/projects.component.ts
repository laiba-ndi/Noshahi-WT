import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/interfaces';

@Component({
    selector: 'app-projects',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="projects-page animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Projects</h1>
          <p class="text-muted">Manage your team's projects</p>
        </div>
        @if (auth.isAdminOrManager()) {
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            New Project
          </button>
        }
      </div>

      @if (loading) {
        <div class="page-loader"><div class="spinner spinner-lg"></div></div>
      } @else {
        <div class="projects-grid">
          @for (p of projects; track p.id) {
            <div class="project-card glass-card" (click)="goToBoard(p)">
              <div class="project-color-bar" [style.background]="p.color"></div>
              <div class="project-card-body">
                <div class="project-top">
                  <span class="project-key">{{ p.key }}</span>
                  <span class="badge" [class]="'badge-' + p.status.toLowerCase()">{{ p.status }}</span>
                </div>
                <h3 class="project-title">{{ p.name }}</h3>
                <p class="project-desc text-muted text-sm">{{ p.description || 'No description' }}</p>
                <div class="project-meta">
                  <div class="meta-item">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
                    {{ p.ownerName }}
                  </div>
                  <div class="meta-item">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>
                    {{ p.doneItems }}/{{ p.totalItems }} tasks
                  </div>
                </div>
                <div class="progress-bar" style="margin-top:10px">
                  <div class="progress-fill" [style.width.%]="getProgress(p)" [style.background]="p.color"></div>
                </div>
              </div>
            </div>
          }
        </div>
        @if (projects.length === 0) {
          <div class="empty-state-large">
            <svg width="48" height="48" fill="none" stroke="var(--text-tertiary)" stroke-width="1" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
          </div>
        }
      }

      <!-- Create Project Modal -->
      @if (showCreateModal) {
        <div class="modal-overlay" (click)="showCreateModal = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Create Project</h2>
              <button class="btn-icon" (click)="showCreateModal = false">✕</button>
            </div>
            <form (ngSubmit)="createProject()">
              <div class="form-group" style="margin-bottom:14px">
                <label>Project Name</label>
                <input class="form-control" [(ngModel)]="newProject.name" name="name" placeholder="e.g. Website Redesign" required>
              </div>
              <div class="form-group" style="margin-bottom:14px">
                <label>Project Key</label>
                <input class="form-control" [(ngModel)]="newProject.key" name="key" placeholder="e.g. WRD" maxlength="6" required style="text-transform:uppercase">
              </div>
              <div class="form-group" style="margin-bottom:14px">
                <label>Description</label>
                <textarea class="form-control" [(ngModel)]="newProject.description" name="desc" placeholder="What's this project about?"></textarea>
              </div>
              <div class="form-group" style="margin-bottom:14px">
                <label>Color</label>
                <div class="color-picker">
                  @for (c of colors; track c) {
                    <button type="button" class="color-swatch" [style.background]="c" [class.active]="newProject.color === c" (click)="newProject.color = c"></button>
                  }
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="showCreateModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .project-card {
      cursor: pointer;
      overflow: hidden;
      transition: all var(--transition-base);
    }
    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    .project-color-bar { height: 4px; }
    .project-card-body { padding: 20px; }
    .project-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .project-key {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-light);
      background: var(--primary-subtle);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .badge-active { background: rgba(16,185,129,0.2); color: #34d399; }
    .badge-archived { background: rgba(100,116,139,0.2); color: #94a3b8; }
    .badge-completed { background: rgba(59,130,246,0.2); color: #60a5fa; }
    .project-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
    .project-desc { margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .project-meta { display: flex; gap: 16px; }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }
    .progress-bar { height: 4px; background: var(--bg-glass); border-radius: var(--radius-full); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.5s; }
    .color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-swatch {
      width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all var(--transition-fast);
    }
    .color-swatch.active { border-color: white; transform: scale(1.2); }
    .color-swatch:hover { transform: scale(1.15); }
    .empty-state-large {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-tertiary);
    }
    .empty-state-large h3 { margin-top: 12px; color: var(--text-secondary); }
    .empty-state-large p { margin-top: 4px; font-size: 13px; }
  `]
})
export class ProjectsComponent implements OnInit {
    projects: Project[] = [];
    loading = true;
    showCreateModal = false;
    colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];
    newProject = { name: '', key: '', description: '', color: '#6366f1' };

    constructor(public api: ApiService, public auth: AuthService) { }

    ngOnInit() {
        this.loadProjects();
    }

    loadProjects() {
        this.api.getProjects().subscribe({
            next: (p) => { this.projects = p; this.loading = false; },
            error: () => this.loading = false
        });
    }

    getProgress(p: Project): number {
        return p.totalItems ? (p.doneItems / p.totalItems) * 100 : 0;
    }

    createProject() {
        this.api.createProject(this.newProject).subscribe({
            next: (p) => {
                this.projects.unshift(p);
                this.showCreateModal = false;
                this.newProject = { name: '', key: '', description: '', color: '#6366f1' };
            }
        });
    }

    goToBoard(p: Project) {
        // Navigate to board filtered by this project
        window.location.href = `/board?projectId=${p.id}`;
    }
}
