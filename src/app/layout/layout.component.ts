import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { User, TimeEntry } from '../models/interfaces';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed" [class.mobile-open]="mobileSidebarOpen">
      <!-- Mobile Overlay -->
      @if (mobileSidebarOpen) {
        <div class="sidebar-overlay" (click)="mobileSidebarOpen = false"></div>
      }
      
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo" (click)="sidebarCollapsed = !sidebarCollapsed">
            <div class="logo-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="url(#gs)" stroke="url(#gs)" stroke-width="1.5"/><defs><linearGradient id="gs" x1="4" y1="3" x2="20" y2="21"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs></svg>
            </div>
            @if (!sidebarCollapsed) {
              <span class="logo-text">TaskWork</span>
            }
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            @if (!sidebarCollapsed) {
              <div class="nav-label">Main</div>
            }
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              @if (!sidebarCollapsed) { <span>Dashboard</span> }
            </a>
            <a routerLink="/projects" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
              @if (!sidebarCollapsed) { <span>Projects</span> }
            </a>
            <a routerLink="/board" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
              @if (!sidebarCollapsed) { <span>Board</span> }
            </a>
            <a routerLink="/tasks" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              @if (!sidebarCollapsed) { <span>My Tasks</span> }
            </a>
          </div>

          <div class="nav-section">
            @if (!sidebarCollapsed) {
              <div class="nav-label">Track</div>
            }
            <a routerLink="/time-tracking" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              @if (!sidebarCollapsed) { <span>Time Tracking</span> }
            </a>
            <a routerLink="/reports" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 20h16M4 20V10m0 10l4 0V14m-4-4l4 0m0 0V14m0 0l4 0V8m0 0l4 0v12m0-12l4 0V4l-4 0"/></svg>
              @if (!sidebarCollapsed) { <span>Reports</span> }
            </a>
          </div>

          @if (user?.role === 'Admin' || user?.role === 'Manager') {
            <div class="nav-section">
              @if (!sidebarCollapsed) {
                <div class="nav-label">Team</div>
              }
              <a routerLink="/team" routerLinkActive="active" class="nav-item">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                @if (!sidebarCollapsed) { <span>Team Management</span> }
              </a>
            </div>
          }
        </nav>

        <div class="sidebar-footer">
          @if (!sidebarCollapsed) {
            <div class="user-info" (click)="logout()">
              <div class="avatar" [style.background]="getAvatarColor(user?.fullName || '')">
                {{ getInitials(user?.fullName || '') }}
              </div>
              <div class="user-details">
                <div class="user-name">{{ user?.fullName }}</div>
                <div class="user-role">{{ user?.role }}</div>
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </div>
          } @else {
            <div class="avatar" [style.background]="getAvatarColor(user?.fullName || '')" (click)="logout()" style="cursor:pointer;margin:0 auto;">
              {{ getInitials(user?.fullName || '') }}
            </div>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <button class="btn-icon toggle-btn desktop-toggle" (click)="sidebarCollapsed = !sidebarCollapsed">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <button class="btn-icon toggle-btn mobile-toggle" (click)="mobileSidebarOpen = !mobileSidebarOpen">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
          <div class="header-right">
            @if (runningTimer && runningTimer.startTime) {
              <div class="timer-widget">
                <div class="timer-dot"></div>
                <span>{{ formatRunningTime() }}</span>
                <span class="timer-task">{{ runningTimer.workItemTitle || 'No task selected' }}</span>
              </div>
            }
            <div class="header-user">
              <div class="avatar avatar-sm" [style.background]="getAvatarColor(user?.fullName || '')">
                {{ getInitials(user?.fullName || '') }}
              </div>
              <span>{{ user?.fullName }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
        
        <!-- Footer -->
        <footer class="main-footer">
          Made by Noshahi Developers Inc.
        </footer>
      </main>
    </div>
  `,
    styles: [`
    .layout { display: flex; height: 100vh; overflow: hidden; }
    .sidebar {
      width: 250px;
      background: var(--gradient-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-base);
      flex-shrink: 0;
      z-index: 10;
    }
    .sidebar-collapsed .sidebar { width: 64px; }
    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      background: var(--gradient-primary);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 17px;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }
    .sidebar-nav {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
    }
    .nav-section { margin-bottom: 8px; }
    .nav-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 12px 12px 6px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 2px;
    }
    .nav-item:hover {
      background: var(--bg-glass);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--primary-subtle);
      color: var(--primary-light);
    }
    .nav-item svg { flex-shrink: 0; }
    .sidebar-collapsed .nav-item { justify-content: center; padding: 10px; }
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--border);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .user-info:hover { background: var(--bg-glass); }
    .user-details { flex: 1; overflow: hidden; }
    .user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 11px; color: var(--text-tertiary); }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-primary);
    }
    .top-header {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: var(--gradient-primary);
      color: white;
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .header-user { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 500; }
    
    .timer-widget {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 600;
      color: white;
      backdrop-filter: blur(10px);
    }
    .timer-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34d399;
      animation: pulse 1.5s ease infinite;
    }
    .timer-task {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    .main-footer {
      padding: 12px 24px;
      text-align: center;
      font-size: 12px;
      color: var(--text-tertiary);
      border-top: 1px solid var(--border);
      background: var(--bg-secondary);
      font-weight: 500;
    }
    .desktop-toggle { display: flex; }
    .mobile-toggle { display: none; }
    
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      display: none;
    }

    @media (max-width: 768px) {
      .desktop-toggle { display: none; }
      .mobile-toggle { display: flex; }
      
      .sidebar {
        position: fixed;
        left: -250px;
        top: 0;
        bottom: 0;
        z-index: 101;
        transition: left var(--transition-base);
      }
      .sidebar-collapsed .sidebar { width: 250px; left: -250px; }
      
      .mobile-open .sidebar {
        left: 0;
        width: 250px;
      }
      .mobile-open .sidebar-overlay { display: block; }
      
      .top-header { padding: 0 16px; }
      .page-content { padding: 16px; }
      .timer-task { display: none; }
      
      /* Force expanded state when open on mobile */
      .mobile-open .logo-text { display: block; }
      .mobile-open .nav-label { display: block; }
      .mobile-open .nav-item span { display: inline; }
      .mobile-open .nav-item { justify-content: flex-start; padding: 10px 12px; }
      .mobile-open .user-info { display: flex; }
      .mobile-open .user-details { display: block; }
    }
  `]
})
export class LayoutComponent implements OnInit {
    user: User | null = null;
    sidebarCollapsed = false;
    mobileSidebarOpen = false;
    runningTimer: TimeEntry | null = null;
    private timerInterval: any;

    constructor(private authService: AuthService, private apiService: ApiService, private router: Router, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.authService.currentUser$.subscribe((u: User | null) => {
            this.user = u;
            this.cdr.markForCheck();
        });
        setTimeout(() => {
            this.checkRunningTimer();
        }, 0);
        this.timerInterval = setInterval(() => this.checkRunningTimer(), 30000);
    }

    checkRunningTimer() {
        this.apiService.getRunningTimer().subscribe({
            next: (timer: TimeEntry | null) => {
                this.runningTimer = timer;
                this.cdr.markForCheck();
            },
            error: () => { }
        });
    }

    formatRunningTime(): string {
        if (!this.runningTimer || !this.runningTimer.startTime) return '00:00';
        const start = new Date(this.runningTimer.startTime).getTime();
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        const hrs = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    getAvatarColor(name: string): string {
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    ngOnDestroy() {
        clearInterval(this.timerInterval);
    }
}
