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

        <div class="notification-card-wrapper">
          <div class="notification-card" [class]="currentNotification.type" (click)="$event.stopPropagation()">
            <!-- Premium Glow Effect -->
            <div class="glow-effect"></div>
            
            <div class="card-inner">
              @if (currentNotification.senderName) {
                <div class="sender-badge animate-slide-down">
                  <div class="sender-avatar">{{ currentNotification.senderName.substring(0, 1) }}</div>
                  <span>{{ currentNotification.senderName }}</span>
                </div>
              }

              <div class="icon-container-outer">
                <div class="icon-container animate-scale-up">
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
              </div>

              <div class="content animate-fade-up">
                <h3>{{ currentNotification.title }}</h3>
                <p>{{ currentNotification.message }}</p>
              </div>

              <div class="footer-actions animate-fade-up">
                @if (currentNotification.actions) {
                  <div class="actions">
                    @for (action of currentNotification.actions; track action.label) {
                      <button class="btn-premium" [class]="'btn-' + (action.type || 'primary')" (click)="action.callback(); close()">
                        {{ action.label }}
                      </button>
                    }
                  </div>
                } @else {
                  <button class="btn-premium btn-secondary full-width" (click)="close()">
                    <span>Confirm</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .notification-overlay {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.7) 0%, rgba(2, 6, 23, 0.9) 100%);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      overflow: hidden;
    }

    .notification-card-wrapper {
      perspective: 1000px;
      width: 100%;
      max-width: 440px;
    }

    .notification-card {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border-radius: 32px;
      padding: 2px; /* For the gradient border */
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
      box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5),
                  inset 0 1px 1px rgba(255, 255, 255, 0.1);
      animation: card-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    .card-inner {
      background: #0f172a; /* Deep elegant dark background */
      border-radius: 30px;
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .glow-effect {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }

    .success .glow-effect { background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%); }
    .error .glow-effect { background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%); }
    .welcome .glow-effect { background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%); }

    .sender-badge {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 12px 4px 6px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      backdrop-filter: blur(5px);
    }
    .sender-avatar {
      width: 20px;
      height: 20px;
      background: var(--gradient-primary, linear-gradient(135deg, #6366f1, #a855f7));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
    }

    .icon-container-outer {
      margin-bottom: 24px;
      position: relative;
    }
    .icon-container-outer::after {
      content: '';
      position: absolute;
      inset: -15px;
      background: inherit;
      border-radius: 50%;
      opacity: 0.2;
      filter: blur(15px);
      z-index: -1;
    }

    .icon-container {
      width: 80px;
      height: 80px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
    }
    .icon-container svg { width: 36px; height: 36px; filter: drop-shadow(0 0 10px currentColor); }

    .success .icon-container { color: #10b981; border-color: rgba(16, 185, 129, 0.3); }
    .error .icon-container { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
    .welcome .icon-container { color: #8b5cf6; border-color: rgba(139, 92, 246, 0.3); }
    .confirm .icon-container { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }

    .content { text-align: center; margin-bottom: 32px; }
    h3 { 
      font-size: 24px; 
      font-weight: 800; 
      margin-bottom: 12px; 
      color: white; 
      letter-spacing: -0.5px;
      background: linear-gradient(to bottom, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { 
      font-size: 16px; 
      color: #94a3b8; 
      line-height: 1.6; 
      max-width: 320px; 
      margin: 0 auto;
    }

    .footer-actions { width: 100%; }
    .btn-premium {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 28px;
      border-radius: 16px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .btn-primary { 
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
      color: white;
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary { 
      background: rgba(255, 255, 255, 0.05); 
      color: white; 
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
    
    .btn-premium.full-width { width: 100%; }
    .btn-premium svg { width: 18px; height: 18px; transition: transform 0.3s; }
    .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -10px rgba(0,0,0,0.5); }
    .btn-premium:hover svg { transform: translateX(3px); }

    /* Animations */
    @keyframes card-entrance {
      from { opacity: 0; transform: scale(0.9) translateY(40px) rotateX(-10deg); }
      to { opacity: 1; transform: scale(1) translateY(0) rotateX(0); }
    }

    .animate-slide-down { animation: slide-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.3s; }
    .animate-scale-up { animation: scale-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: 0.1s; }
    .animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }

    @keyframes slide-down {
      from { opacity: 0; transform: translate(-50%, -20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes scale-up {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Existing Petal Animations */
    .petal-container { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
    .petal { position: absolute; top: -20px; border-radius: 100% 0 100% 0; animation: fall linear forwards; }
    @keyframes fall {
      0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg) translateX(100px); opacity: 0; }
    }
    .fade-in { animation: fade-overlay 0.4s ease-out; }
    @keyframes fade-overlay { from { opacity: 0; } to { opacity: 1; } }
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
