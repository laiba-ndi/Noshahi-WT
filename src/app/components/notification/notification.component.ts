import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

interface Petal {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  color: string;
  rotation: string;
  type: number;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (currentNotification) {
      <div class="notification-overlay fade-in" (click)="closeOnOverlay($event)">
        <!-- Petal Container -->
        @if (currentNotification.type === 'success' || currentNotification.type === 'welcome') {
          <div class="petal-container">
            @for (p of petals; track p.id) {
              <div class="petal" 
                   [style.left]="p.left" 
                   [style.animation-delay]="p.delay" 
                   [style.animation-duration]="p.duration"
                   [style.background-color]="p.color"
                   [style.width]="p.size"
                   [style.height]="p.size"
                   [style.transform]="'rotate(' + p.rotation + ')'"
                   [class]="'petal-type-' + p.type">
              </div>
            }
          </div>
        }

        <div class="notification-card" [class]="currentNotification.type" (click)="$event.stopPropagation()">
          <div class="icon-container">
            @if (currentNotification.type === 'success') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            } @else if (currentNotification.type === 'error') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            } @else if (currentNotification.type === 'welcome') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            } @else if (currentNotification.type === 'confirm') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            }
          </div>
          <div class="content">
            <h3>{{ currentNotification.title }}</h3>
            <p>{{ currentNotification.message }}</p>
          </div>
          @if (currentNotification.actions) {
            <div class="actions">
              @for (action of currentNotification.actions; track action.label) {
                <button class="btn" [class]="'btn-' + (action.type || 'primary')" (click)="action.callback(); close()">
                  {{ action.label }}
                </button>
              }
            </div>
          } @else {
             <button class="close-btn" (click)="close()">Got it</button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .notification-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      overflow: hidden;
    }
    .notification-card {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 24px;
      padding: 32px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      z-index: 2;
    }
    .icon-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      background: #f3f4f6;
    }
    .icon-container svg { width: 32px; height: 32px; }

    .success .icon-container { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .error .icon-container { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .welcome .icon-container { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .confirm .icon-container { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

    h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111827; }
    p { font-size: 15px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }

    .actions { display: flex; gap: 12px; justify-content: center; }
    .btn {
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-secondary { background: #f3f4f6; color: #4b5563; }
    .btn-danger { background: #ef4444; color: white; }
    .btn:hover { transform: translateY(-1px); filter: brightness(1.1); }

    .close-btn {
      background: #f3f4f6;
      border: none;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      color: #4b5563;
      cursor: pointer;
      transition: background 0.2s;
    }
    .close-btn:hover { background: #e5e7eb; }

    /* Petal Animations */
    .petal-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }
    .petal {
      position: absolute;
      top: -20px;
      background-color: #ff9a9e;
      border-radius: 100% 0 100% 0;
      animation: fall linear forwards;
    }
    .petal-type-1 { border-radius: 100% 0 100% 0; }
    .petal-type-2 { border-radius: 50%; }
    .petal-type-3 { border-radius: 0 100% 0 100%; }

    @keyframes fall {
      0% {
        transform: translateY(0) rotate(0deg) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      100% {
        transform: translateY(110vh) rotate(720deg) translateX(100px);
        opacity: 0;
      }
    }

    @keyframes pop-in {
      from { opacity: 0; transform: scale(0.8) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .fade-in { animation: fade-overlay 0.3s ease-out; }
    @keyframes fade-overlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  currentNotification: Notification | null = null;
  petals: Petal[] = [];
  private sub: Subscription | null = null;
  private timeoutId: any;

  constructor(private service: NotificationService) { }

  ngOnInit() {
    this.sub = this.service.notifications$.subscribe(n => {
      this.currentNotification = n;
      if (this.timeoutId) clearTimeout(this.timeoutId);

      if (n) {
        if (n.type === 'success' || n.type === 'welcome') {
          this.spawnPetals();
        } else {
          this.petals = [];
        }

        if (n.duration && n.type !== 'confirm') {
          this.timeoutId = setTimeout(() => this.close(), n.duration);
        }
      } else {
        this.petals = [];
      }
    });
  }

  spawnPetals() {
    const colors = ['#ff9a9e', '#fad0c4', '#ffecd2', '#fcb69f', '#ffdde1', '#ee9ca7', '#ffafbd', '#ffc3a0'];
    const newPetals: Petal[] = [];
    for (let i = 0; i < 40; i++) {
      newPetals.push({
        id: i,
        left: Math.random() * 100 + '%',
        delay: Math.random() * 2 + 's',
        duration: (Math.random() * 3 + 2) + 's',
        size: (Math.random() * 10 + 10) + 'px',
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360 + 'deg',
        type: Math.floor(Math.random() * 3) + 1
      });
    }
    this.petals = newPetals;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  close() {
    this.service.close();
  }

  closeOnOverlay(event: MouseEvent) {
    if (this.currentNotification?.type !== 'confirm') {
      this.close();
    }
  }
}
