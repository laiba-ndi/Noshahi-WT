import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/interfaces';

@Component({
    selector: 'app-team',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="team-page animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Team Management</h1>
          <p class="text-muted">Manage your organization's users and roles</p>
        </div>
        @if (auth.hasRole('Admin')) {
          <button class="btn btn-primary" (click)="showInviteModal = true">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Invite User
          </button>
        }
      </div>

      @if (loading) {
        <div class="page-loader"><div class="spinner spinner-lg"></div></div>
      } @else {
        <div class="glass-card table-card">
          <table class="team-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                @if (auth.hasRole('Admin')) { <th>Actions</th> }
              </tr>
            </thead>
            <tbody>
              @for (u of users; track u.id) {
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="avatar" [style.background]="getAvatarColor(u.fullName)">
                        {{ getInitials(u.fullName) }}
                      </div>
                      <div class="user-info">
                        <div class="user-name">{{ u.fullName }}</div>
                        <div class="user-email">{{ u.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge" [class]="u.role.toLowerCase()">{{ u.role }}</span>
                  </td>
                  <td>{{ u.department || '—' }}</td>
                  <td>
                    <span class="status-dot" [class.active]="u.isActive"></span>
                    {{ u.isActive ? 'Active' : 'Hidden' }}
                  </td>
                  <td>{{ u.createdAt | date:'mediumDate' }}</td>
                  @if (auth.hasRole('Admin')) {
                    <td>
                      <div class="action-btns">
                        <button class="btn-icon" title="Edit Role" (click)="openRoleModal(u)">
                          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <button class="btn-icon" [title]="u.isActive ? 'Deactivate' : 'Activate'" (click)="toggleActive(u)">
                          @if (u.isActive) {
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                          } @else {
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          }
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Role Change Modal -->
      @if (selectedUser) {
        <div class="modal-overlay" (click)="selectedUser = null">
          <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px">
            <div class="modal-header">
              <h2>Change User Role</h2>
              <button class="btn-icon" (click)="selectedUser = null">✕</button>
            </div>
            <div class="form-group">
              <label>Role for {{ selectedUser.fullName }}</label>
              <select class="form-control" [(ngModel)]="newRole">
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="selectedUser = null">Cancel</button>
              <button class="btn btn-primary" (click)="updateRole()">Save Changes</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .table-card { overflow: hidden; }
    .team-table { width: 100%; border-collapse: collapse; text-align: left; }
    .team-table th { padding: 14px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); border-bottom: 1px solid var(--border); }
    .team-table td { padding: 14px 20px; border-bottom: 1px solid var(--border); font-size: 13px; }
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-name { font-weight: 600; color: var(--text-primary); }
    .user-email { font-size: 11px; color: var(--text-tertiary); }
    .role-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); text-transform: uppercase; }
    .role-badge.admin { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    .role-badge.manager { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .role-badge.employee { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; margin-right: 6px; }
    .status-dot.active { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
    .action-btns { display: flex; gap: 4px; }
  `]
})
export class TeamComponent implements OnInit {
    users: User[] = [];
    loading = true;
    showInviteModal = false;
    selectedUser: User | null = null;
    newRole = '';

    constructor(public api: ApiService, public auth: AuthService) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.api.getUsers().subscribe({
            next: (u) => { this.users = u; this.loading = false; },
            error: () => this.loading = false
        });
    }

    toggleActive(u: User) {
        this.api.toggleUserActive(u.id).subscribe(() => u.isActive = !u.isActive);
    }

    openRoleModal(u: User) {
        this.selectedUser = u;
        this.newRole = u.role;
    }

    updateRole() {
        if (this.selectedUser) {
            this.api.changeUserRole(this.selectedUser.id, this.newRole).subscribe(() => {
                if (this.selectedUser) this.selectedUser.role = this.newRole;
                this.selectedUser = null;
            });
        }
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    getAvatarColor(name: string): string {
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }
}
