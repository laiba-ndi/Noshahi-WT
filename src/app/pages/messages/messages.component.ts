import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  // ... rest of component
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-container glass-card animate-fade-in" [class.mobile-chat-open]="selectedUserId && mobileShowChat">
      <!-- Sidebar -->
      <div class="messages-sidebar">
        <div class="sidebar-header">
          <h2>Messages</h2>
        </div>
        
        <div class="search-box">
          <input type="text" placeholder="Search contacts..." [(ngModel)]="searchQuery" (input)="filterUsers()">
        </div>

        <div class="conversation-list">
          @if (searchQuery) {
            <div class="section-label">Results</div>
            @for (u of filteredUsers; track u.id) {
              <div class="convo-item" (click)="selectUser(u)" [class.active]="selectedUserId === u.id">
                <div class="avatar" [style.background]="getAvatarColor(u.fullName)">{{ getInitials(u.fullName) }}</div>
                <div class="convo-info">
                  <div class="convo-name">{{ u.fullName }}</div>
                  <div class="text-xs text-muted">{{ u.jobTitle || 'Team Member' }}</div>
                </div>
              </div>
            }
          } @else {
            @for (c of recentConversations; track c.id) {
              <div class="convo-item" (click)="selectUserId(c.senderId === currentUserId ? c.receiverId : c.senderId)" 
                   [class.active]="selectedUserId === (c.senderId === currentUserId ? c.receiverId : c.senderId)">
                <div class="avatar" [style.background]="getAvatarColor(c.senderId === currentUserId ? c.receiverName : c.senderName)">
                  {{ getInitials(c.senderId === currentUserId ? c.receiverName : c.senderName) }}
                </div>
                <div class="convo-info">
                  <div class="convo-name">{{ c.senderId === currentUserId ? c.receiverName : c.senderName }}</div>
                  <div class="convo-last text-truncate">{{ c.content }}</div>
                </div>
                @if (!c.isRead && c.receiverId === currentUserId) {
                  <div class="unread-dot"></div>
                }
              </div>
            }
            @if (recentConversations.length === 0) {
              <div class="empty-state">No recent conversations. Start searching to chat!</div>
            }
          }
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        @if (selectedUserId) {
          <div class="chat-header">
             <button class="btn-icon mobile-back" (click)="mobileShowChat = false">
               <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
             </button>
             <div class="avatar" [style.background]="getAvatarColor(selectedUserName)">{{ getInitials(selectedUserName) }}</div>
             <div class="chat-header-info">
               <div class="chat-name">{{ selectedUserName }}</div>
               <div class="chat-status">Online</div>
             </div>
          </div>

          <div class="chat-messages" #scrollContainer>
            @for (m of messages; track m.id) {
              <div class="message-row" [class.sent]="m.senderId === currentUserId">
                <div class="message-bubble">
                  {{ m.content }}
                  <div class="message-time">{{ m.sentAt | date:'shortTime' }}</div>
                </div>
              </div>
            }
            @if (messages.length === 0) {
              <div class="empty-chat">
                <div class="icon">💬</div>
                <p>No messages yet. Say hi!</p>
              </div>
            }
          </div>

          <div class="chat-input">
            <input type="text" placeholder="Type a message..." [(ngModel)]="newMessage" (keyup.enter)="sendMessage()">
            <button class="btn btn-primary" (click)="sendMessage()" [disabled]="!newMessage.trim()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        } @else {
          <div class="no-selection">
            <div class="no-selection-content text-center">
              <div class="big-icon">✉️</div>
              <h2>Your Messenger</h2>
              <p class="text-muted">Select a conversation or search for a teammate to start chatting.</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .messages-container {
      display: flex;
      height: calc(100vh - 140px);
      overflow: hidden;
      border: 1px solid var(--border);
      padding: 0 !important;
    }
    .messages-sidebar {
      width: 300px;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      background: rgba(255,255,255,0.02);
    }
    .sidebar-header { padding: 20px; border-bottom: 1px solid var(--border); }
    .sidebar-header h2 { font-size: 18px; font-weight: 800; }
    .search-box { padding: 12px; }
    .search-box input {
      width: 100%;
      background: var(--bg-glass);
      border: 1px solid var(--border);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }
    .conversation-list { flex: 1; overflow-y: auto; }
    .section-label { padding: 8px 20px; font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; }
    .convo-item {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .convo-item:hover { background: var(--bg-glass); }
    .convo-item.active { background: var(--primary-subtle); border-left: 3px solid var(--color-primary); }
    .convo-info { flex: 1; min-width: 0; }
    .convo-name { font-weight: 600; font-size: 14px; }
    .convo-last { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .unread-dot { width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%; }

    .chat-area { flex: 1; display: flex; flex-direction: column; background: rgba(255,255,255,0.01); }
    .chat-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.02);
    }
    .chat-name { font-weight: 700; font-size: 15px; }
    .chat-status { font-size: 11px; color: #10b981; }

    .chat-messages { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
    .message-row { display: flex; }
    .message-row.sent { justify-content: flex-end; }
    .message-bubble {
      max-width: 70%;
      padding: 10px 16px;
      border-radius: 18px;
      background: var(--bg-glass);
      font-size: 14px;
      position: relative;
    }
    .sent .message-bubble {
      background: var(--gradient-primary);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .message-row:not(.sent) .message-bubble {
      border: 1px solid var(--border);
      border-bottom-left-radius: 4px;
    }
    .message-time { font-size: 10px; margin-top: 4px; opacity: 0.7; }

    .chat-input { padding: 20px; border-top: 1px solid var(--border); display: flex; gap: 12px; }
    .chat-input input { flex: 1; background: var(--bg-glass); border: 1px solid var(--border); padding: 12px 20px; border-radius: var(--radius-full); }

    .no-selection { flex: 1; display: flex; align-items: center; justify-content: center; }
    .big-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state { padding: 40px 20px; text-align: center; color: var(--text-tertiary); font-size: 13px; }
    .empty-chat { text-align: center; margin-top: 100px; color: var(--text-tertiary); }
    .empty-chat .icon { font-size: 48px; margin-bottom: 8px; }

    .mobile-back { display: none; margin-right: 8px; }

    @media (max-width: 768px) {
      .messages-sidebar { width: 100%; border-right: none; }
      .convo-info, .sidebar-header, .search-box { display: block; }
      .mobile-chat-open .messages-sidebar { display: none; }
      .mobile-chat-open .chat-area { display: flex; }
      .chat-area { display: none; }
      .mobile-back { display: flex; }
    }
  `]
})
export class MessagesComponent implements OnInit, OnDestroy {
  currentUserId = 0;
  recentConversations: any[] = [];
  selectedUserId: number | null = null;
  selectedUserName = '';
  messages: any[] = [];
  newMessage = '';
  mobileShowChat = false;

  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery = '';

  private pollInterval: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUserId = this.auth.getCurrentUser()?.id || 0;
    this.loadRecentConversations();
    this.loadAllUsers();

    this.route.queryParams.subscribe(params => {
      if (params['with']) {
        const userId = parseInt(params['with']);
        this.api.getUser(userId).subscribe(user => {
          this.selectUser(user);
        });
      }
    });

    this.pollInterval = setInterval(() => {
      this.loadRecentConversations();
      if (this.selectedUserId) {
        this.loadConversation(this.selectedUserId);
      }
    }, 5000);
  }

  loadRecentConversations() {
    this.api.getRecentMessages().subscribe(res => {
      this.recentConversations = res;
      this.cdr.markForCheck();
    });
  }

  loadAllUsers() {
    this.api.getUsers().subscribe(users => {
      this.users = users.filter((u: any) => u.id !== this.currentUserId);
      this.cdr.markForCheck();
    });
  }

  filterUsers() {
    if (!this.searchQuery) {
      this.filteredUsers = [];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(u => u.fullName.toLowerCase().includes(q));
  }

  selectUserId(id: number) {
    const convo = this.recentConversations.find(c => c.senderId === id || c.receiverId === id);
    const name = convo.senderId === this.currentUserId ? convo.receiverName : convo.senderName;
    this.selectUser({ id, fullName: name });
  }

  selectUser(user: any) {
    this.selectedUserId = user.id;
    this.selectedUserName = user.fullName;
    this.searchQuery = '';
    this.filteredUsers = [];
    this.mobileShowChat = true;
    this.loadConversation(user.id);
  }

  loadConversation(id: number) {
    this.api.getConversation(id).subscribe(messages => {
      this.messages = messages;
      this.cdr.markForCheck();
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUserId) return;

    this.api.sendMessage(this.selectedUserId, this.newMessage).subscribe(res => {
      this.messages.push(res);
      this.newMessage = '';
      this.loadRecentConversations();
      this.cdr.markForCheck();
    });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '';
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
    let hash = 0;
    if (!name) return colors[0];
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }
}
