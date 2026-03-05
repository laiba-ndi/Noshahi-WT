import { Component, OnInit, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import { User, TimeEntry, Notification } from '../models/interfaces';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

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
              <span class="logo-text">Noshahi TeamWork</span>
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
            <a routerLink="/messages" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              @if (!sidebarCollapsed) { <span>Messages</span> }
              @if (unreadMessageCount > 0) {
                <span class="badge badge-sm badge-danger" [class.badge-dot]="sidebarCollapsed">{{ sidebarCollapsed ? '' : unreadMessageCount }}</span>
              }
            </a>

            <a routerLink="/drive" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
              @if (!sidebarCollapsed) { <span>My Drive</span> }
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
            
            <!-- Notifications & Messages Icons -->
            <div class="header-actions">
              <div class="action-btn-container">
                <button class="btn-icon header-btn" (click)="activeTab = 'messages'; showNotifications = true; $event.stopPropagation()">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  @if (unreadMessageCount > 0) {
                    <span class="btn-badge">{{ unreadMessageCount }}</span>
                  }
                </button>
              </div>

              <div class="action-btn-container">
                <button class="btn-icon header-btn" (click)="activeTab = 'alerts'; showNotifications = true; $event.stopPropagation()">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                  @if (unreadNotificationCount > 0) {
                    <span class="btn-badge">{{ unreadNotificationCount }}</span>
                  }
                </button>
                
                @if (showNotifications) {
                  <div class="notification-dropdown interactive-glass animate-pop-in" (click)="$event.stopPropagation()">
                    <div class="dropdown-tabs">
                      <button [class.active]="activeTab === 'alerts'" (click)="activeTab = 'alerts'">
                        Alerts
                        @if (unreadNotificationCount > 0) {
                          <span class="tab-badge">{{ unreadNotificationCount }}</span>
                        }
                      </button>
                      <button [class.active]="activeTab === 'messages'" (click)="activeTab = 'messages'">
                        Messages
                        @if (unreadMessageCount > 0) {
                          <span class="tab-badge">{{ unreadMessageCount }}</span>
                        }
                      </button>
                    </div>

                    <div class="dropdown-list-container">
                      @if (activeTab === 'alerts') {
                        <div class="dropdown-header">
                          <span class="text-xs font-bold text-tertiary">SYSTEM ALERTS</span>
                          <button class="btn-text-premium" (click)="markAllAsRead()">Mark all read</button>
                        </div>
                        <div class="dropdown-list">
                          @for (n of notifications; track n.id) {
                            <div class="dropdown-item-premium" [class.unread]="!n.isRead" (click)="handleNotificationClick(n)">
                              <div class="item-icon-outer" [class]="n.title.toLowerCase().includes('error') ? 'error' : 'success'">
                                <div class="item-icon-inner">✦</div>
                              </div>
                              <div class="item-content">
                                <div class="item-header">
                                  <span class="item-title">{{ n.title }}</span>
                                  <span class="item-time">{{ n.createdAt | date:'shortTime' }}</span>
                                </div>
                                <div class="item-text">{{ n.message }}</div>
                                @if (n.senderName) {
                                  <div class="item-sender">
                                    <div class="sender-dot"></div>
                                    <span>From {{ n.senderName }}</span>
                                  </div>
                                }
                              </div>
                            </div>
                          }
                          @if (notifications.length === 0) {
                            <div class="empty-dropdown-premium">
                              <div class="empty-icon">🔔</div>
                              <p>All clear! No new alerts.</p>
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="dropdown-header">
                          <span class="text-xs font-bold text-tertiary">RECENT CONVERSATIONS</span>
                          <a routerLink="/messages" class="btn-text-premium" (click)="showNotifications = false">View All</a>
                        </div>
                        <div class="dropdown-list">
                          @for (m of recentMessages; track m.id) {
                            <div class="dropdown-item-premium" [class.unread]="!m.isRead && m.receiverId === user?.id" (click)="handleMessageClick(m)">
                              <div class="item-avatar" [style.background]="getAvatarColor(m.senderId === user?.id ? m.receiverName : m.senderName)">
                                {{ getInitials(m.senderId === user?.id ? m.receiverName : m.senderName) }}
                              </div>
                              <div class="item-content">
                                <div class="item-header">
                                  <span class="item-title">{{ m.senderId === user?.id ? m.receiverName : m.senderName }}</span>
                                  <span class="item-time">{{ m.sentAt | date:'shortTime' }}</span>
                                </div>
                                <div class="item-text text-truncate">{{ m.content }}</div>
                              </div>
                            </div>
                          }
                          @if (recentMessages.length === 0) {
                            <div class="empty-dropdown-premium">
                              <div class="empty-icon">💬</div>
                              <p>No messages yet.</p>
                            </div>
                          }
                        </div>
                      }
                    </div>
                    
                    <div class="dropdown-footer">
                      <button class="footer-btn" (click)="showNotifications = false">
                        Close Panel
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

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
    .toggle-btn {
      color: white !important;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }
    .toggle-btn:hover { background: rgba(255, 255, 255, 0.25); transform: scale(1.05); }
    .header-right { display: flex; align-items: center; gap: 20px; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .action-btn-container { position: relative; }
    .header-btn {
      color: white;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-btn:hover { 
      background: rgba(255, 255, 255, 0.25); 
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .btn-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: var(--radius-full);
      border: 2px solid var(--color-primary);
      min-width: 18px;
    }
    
    .notification-dropdown.interactive-glass {
      position: absolute;
      top: calc(100% + 15px);
      right: 0;
      width: min(360px, calc(100vw - 48px));
      max-height: 520px;
      background: linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(30, 58, 138, 0.95) 100%);
      backdrop-filter: blur(30px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 28px;
      box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      z-index: 1000;
      overflow: hidden;
      animation: dropdown-entrance 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes dropdown-entrance {
      from { opacity: 0; transform: translateY(-10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .dropdown-tabs {
      display: flex;
      padding: 8px;
      background: rgba(255, 255, 255, 0.07);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .dropdown-tabs button {
      flex: 1;
      padding: 10px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .dropdown-tabs button.active {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .tab-badge {
      background: #ef4444;
      color: white;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 10px;
    }

    .dropdown-list-container { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

    .dropdown-header {
      padding: 16px 20px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-text-premium {
      background: transparent;
      border: none;
      color: #818cf8;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-text-premium:hover { color: #a5b4fc; text-decoration: underline; }

    .dropdown-list { overflow-y: auto; padding: 10px; flex: 1; }
    
    .dropdown-item-premium {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 4px;
      position: relative;
    }
    .dropdown-item-premium:hover {
      background: rgba(255, 255, 255, 0.05);
      transform: translateX(4px);
    }
    .dropdown-item-premium.unread::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      background: #818cf8;
      border-radius: 50%;
      box-shadow: 0 0 10px #818cf8;
    }

    .item-icon-outer {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .item-icon-outer.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .item-icon-outer.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    
    .item-avatar {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .item-content { flex: 1; min-width: 0; }
    .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .item-title { font-weight: 700; font-size: 14px; color: white; }
    .item-time { font-size: 11px; color: rgba(255, 255, 255, 0.4); }
    .item-text { font-size: 13px; color: rgba(255, 255, 255, 0.6); line-height: 1.4; }
    .text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .item-sender {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 11px;
      color: #818cf8;
      font-weight: 600;
    }
    .sender-dot { width: 6px; height: 6px; background: #818cf8; border-radius: 50%; }

    .empty-dropdown-premium {
      padding: 60px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .empty-icon { font-size: 40px; filter: grayscale(1) opacity(0.3); }
    .empty-dropdown-premium p { color: rgba(255, 255, 255, 0.3); font-size: 14px; font-weight: 500; }

    .dropdown-footer {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(255, 255, 255, 0.02);
    }
    .footer-btn {
      width: 100%;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .footer-btn:hover { background: rgba(255, 255, 255, 0.1); }

    .badge {
      padding: 2px 6px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 700;
      margin-left: auto;
    }
    .badge-danger { background: #fee2e2; color: #ef4444; }
    .badge-dot {
      width: 8px;
      height: 8px;
      padding: 0;
      margin: 0;
      position: absolute;
      top: 10px;
      right: 10px;
    }

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
export class LayoutComponent implements OnInit, OnDestroy {
  user: User | null = null;
  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  runningTimer: TimeEntry | null = null;

  unreadNotificationCount = 0;
  unreadMessageCount = 0;
  showNotifications = false;
  notifications: Notification[] = [];
  recentMessages: any[] = [];
  activeTab: 'alerts' | 'messages' = 'alerts';

  private knownNotificationIds = new Set<number>();
  private isInitialLoad = true;

  private timerInterval: any;
  private pollInterval: any;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe((u: User | null) => {
      this.user = u;
      this.cdr.markForCheck();
    });
    setTimeout(() => {
      this.checkRunningTimer();
      this.fetchUnreadCounts();
    }, 0);
    this.timerInterval = setInterval(() => this.checkRunningTimer(), 30000);
    this.pollInterval = setInterval(() => this.fetchUnreadCounts(), 10000); // Poll every 10s
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

  fetchUnreadCounts() {
    if (!this.user) return;

    // Parallel fetch counts
    this.apiService.getNotifications(true).subscribe(n => {
      this.notifications = n;
      this.unreadNotificationCount = n.length;

      // Detect new notifications and show beautiful popup
      if (this.isInitialLoad) {
        n.forEach(notif => this.knownNotificationIds.add(notif.id));
        this.isInitialLoad = false;
      } else {
        n.forEach(notif => {
          if (!this.knownNotificationIds.has(notif.id)) {
            this.knownNotificationIds.add(notif.id);
            // Trigger beautiful premium popup
            this.notificationService.notify({
              title: notif.title,
              message: notif.message,
              type: notif.title.toLowerCase().includes('error') ? 'error' : 'success',
              senderName: notif.senderName,
              duration: 6000
            });
          }
        });
      }

      this.cdr.markForCheck();
    });

    this.apiService.getRecentMessages().subscribe(m => {
      this.recentMessages = m;
      this.unreadMessageCount = m.filter(msg => !msg.isRead && msg.receiverId === this.user?.id).length;
      this.cdr.markForCheck();
    });
  }

  handleMessageClick(m: any) {
    this.showNotifications = false;
    this.router.navigate(['/messages'], { queryParams: { with: m.senderId === this.user?.id ? m.receiverId : m.senderId } });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.apiService.getNotifications(false).subscribe(n => {
        this.notifications = n;
        this.cdr.markForCheck();
      });
    }
  }

  markAllAsRead() {
    // Implement backend endpoint for this or loop through
    this.notifications.forEach(n => {
      if (!n.isRead) this.apiService.markNotificationAsRead(n.id).subscribe();
    });
    this.unreadNotificationCount = 0;
    this.notifications.forEach(n => n.isRead = true);
    this.cdr.markForCheck();
  }

  handleNotificationClick(n: any) {
    if (!n.isRead) {
      this.apiService.markNotificationAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.unreadNotificationCount = Math.max(0, this.unreadNotificationCount - 1);
        this.cdr.markForCheck();
      });
    }
    if (n.link) {
      this.router.navigateByUrl(n.link);
      this.showNotifications = false;
    }
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

  @HostListener('document:click')
  onDocumentClick() {
    this.showNotifications = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    clearInterval(this.pollInterval);
  }
}
