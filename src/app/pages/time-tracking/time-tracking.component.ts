import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TimeEntry, WorkItem } from '../../models/interfaces';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="time-page animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Time Tracking</h1>
          <p class="text-muted">Track time spent on tasks</p>
        </div>
      </div>

      <!-- Timer Widget -->
      <div class="timer-section glass-card">
        @if (runningTimer) {
          <div class="timer-active">
            <div class="timer-display">
              <div class="timer-dot-lg"></div>
              <span class="timer-time">{{ formatTime() }}</span>
            </div>
            <div class="timer-info">
              <div class="timer-task-name">{{ runningTimer.workItemTitle || 'No task linked' }}</div>
              <div class="timer-desc text-muted text-sm">{{ runningTimer.description || 'No description' }}</div>
            </div>
            <button class="btn btn-danger" (click)="stopTimer()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              Stop
            </button>
          </div>
        } @else {
          <div class="timer-start">
            <div class="start-form">
              <select class="form-control" [(ngModel)]="newTimer.workItemId">
                <option [ngValue]="null">No task (general)</option>
                @for (w of workItems; track w.id) {
                  <option [ngValue]="w.id">{{ w.itemKey }} - {{ w.title }}</option>
                }
              </select>
              <input class="form-control" [(ngModel)]="newTimer.description" placeholder="What are you working on?">
              <button class="btn btn-primary" (click)="startTimer()">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21"/></svg>
                Start Timer
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Manual Entry -->
      <div class="manual-section glass-card">
        <div class="card-header">
          <h3>Log Time Manually</h3>
          <button class="btn btn-sm btn-secondary" (click)="showManual = !showManual">
            {{ showManual ? 'Hide' : 'Add Entry' }}
          </button>
        </div>
        @if (showManual) {
          <form (ngSubmit)="logManualTime()" class="manual-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label>Task (optional)</label>
                <select class="form-control" [(ngModel)]="manualEntry.workItemId" name="task">
                  <option [ngValue]="null">No task</option>
                  @for (w of workItems; track w.id) {
                    <option [ngValue]="w.id">{{ w.itemKey }} - {{ w.title }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Description</label>
                <input class="form-control" [(ngModel)]="manualEntry.description" name="desc" placeholder="What did you work on?">
              </div>
              <div class="form-group">
                <label>Start Time</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="manualEntry.startTime" name="start" required>
              </div>
              <div class="form-group">
                <label>End Time</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="manualEntry.endTime" name="end" required>
              </div>
            </div>
            <div style="margin-top:12px;text-align:right">
              <button type="submit" class="btn btn-primary">Log Time</button>
            </div>
          </form>
        }
      </div>

      <!-- Time Entries List -->
      <div class="entries-section glass-card">
        <div class="card-header">
          <h3>Recent Time Entries</h3>
          <span class="text-muted text-sm">Total: {{ getTotalHours() | number:'1.1-1' }}h</span>
        </div>
        <div class="entries-list">
          @for (e of entries; track e.id) {
            <div class="entry-row">
              <div class="entry-info">
                <div class="entry-task">{{ e.workItemTitle || 'General' }}</div>
                <div class="entry-desc text-sm text-muted">{{ e.description || 'No description' }}</div>
              </div>
              <div class="entry-meta">
                <span class="entry-duration">{{ formatDuration(e.duration) }}</span>
                <span class="entry-date text-xs text-muted">{{ e.startTime | date:'shortDate' }}</span>
                @if (auth.isAdminOrManager() && !e.isRunning) {
                  <button class="btn btn-xs btn-link" (click)="viewScreenshots(e)">View Proof</button>
                }
              </div>
            </div>
          }
          @if (entries.length === 0) {
            <div class="empty-state" style="padding:30px">No time entries yet</div>
          }
        </div>
      </div>

      <!-- Screenshot Gallery Modal -->
      @if (viewingEntry) {
        <div class="modal-overlay" (click)="viewingEntry = null">
          <div class="modal-content gallery-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Proof of Work: {{ viewingEntry.userName }}</h2>
              <button class="btn-icon" (click)="viewingEntry = null">✕</button>
            </div>
            <div class="gallery-content">
              @if (loadingScreenshots) {
                <div class="spinner"></div>
              } @else if (screenshots.length === 0) {
                <div class="empty-state">No screenshots captured for this session.</div>
              } @else {
                <div class="screenshot-grid">
                  @for (s of screenshots; track s.id) {
                    <div class="screenshot-item">
                      <img [src]="s.screenshotData" alt="Work screen capture">
                      <div class="screenshot-time">{{ s.capturedAt | date:'shortTime' }}</div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 20px; }
    .page-header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .timer-section { padding: 20px; margin-bottom: 16px; }
    .timer-active {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .timer-display { display: flex; align-items: center; gap: 12px; }
    .timer-dot-lg {
      width: 14px; height: 14px; border-radius: 50%; background: #10b981;
      animation: pulse 1.5s ease infinite;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
    }
    .timer-time {
      font-size: 32px;
      font-weight: 800;
      font-family: 'Inter', monospace;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .timer-info { flex: 1; }
    .timer-task-name { font-size: 14px; font-weight: 600; }
    .timer-start { }
    .start-form { display: flex; gap: 10px; align-items: center; }
    .start-form select { width: 250px; }
    .start-form input { flex: 1; }
    .manual-section { padding: 20px; margin-bottom: 16px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { font-size: 15px; font-weight: 700; }
    .manual-form { }
    .entries-section { padding: 20px; }
    .entries-list { display: flex; flex-direction: column; }
    .entry-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .entry-row:last-child { border-bottom: none; }
    .entry-task { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
    .entry-meta { text-align: right; }
    .entry-duration { font-size: 15px; font-weight: 700; display: block; }
    .btn-xs { padding: 2px 8px; font-size: 10px; height: auto; }
    .btn-link { background: none; color: var(--color-primary); text-decoration: underline; cursor: pointer; border: none; }
    
    .gallery-modal { max-width: 900px !important; width: 90%; }
    .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-top: 16px; }
    .screenshot-item { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
    .screenshot-item img { width: 100%; height: auto; display: block; }
    .screenshot-time { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; font-size: 10px; }
  `]
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  runningTimer: TimeEntry | null = null;
  entries: TimeEntry[] = [];
  workItems: WorkItem[] = [];
  showManual = false;
  newTimer: any = { workItemId: null, description: '' };
  manualEntry: any = { workItemId: null, description: '', startTime: '', endTime: '' };

  viewingEntry: TimeEntry | null = null;
  screenshots: any[] = [];
  loadingScreenshots = false;

  private tickInterval: any;
  private screenshotTimeout: any;
  private screenStream: MediaStream | null = null;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();
    this.tickInterval = setInterval(() => {
      this.cdr.markForCheck();
    }, 1000); // force re-render for timer
  }

  loadData() {
    this.api.getRunningTimer().subscribe(t => {
      this.runningTimer = t;
      this.cdr.markForCheck();
    });
    this.api.getTimeEntries().subscribe(e => {
      this.entries = e;
      this.cdr.markForCheck();
    });
    this.api.getWorkItems().subscribe(w => {
      this.workItems = w;
      this.cdr.markForCheck();
    });
  }

  async startTimer() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' } as any,
        audio: false
      });

      // Handle user clicking "Stop sharing" in browser UI
      this.screenStream.getVideoTracks().forEach(track => {
        track.onended = () => {
          if (this.runningTimer) {
            this.stopTimer();
          }
        };
      });

      this.api.startTimer(this.newTimer.workItemId, this.newTimer.description).subscribe({
        next: (t) => {
          this.runningTimer = t;
          this.newTimer = { workItemId: null, description: '' };

          // CRITICAL: Capture immediate screenshot so "Proof of Work" isn't empty if stopped quickly
          setTimeout(() => this.captureAndUpload(), 1000);

          this.scheduleNextScreenshot();
          this.cdr.markForCheck();
        },
        error: () => {
          this.stopScreenStream();
        }
      });
    } catch (err) {
      console.error('Screen capture permission denied', err);
    }
  }

  private stopScreenStream() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    if (this.screenshotTimeout) {
      clearTimeout(this.screenshotTimeout);
    }
  }

  private scheduleNextScreenshot() {
    if (!this.runningTimer || !this.screenStream) return;

    // Random interval between 5 and 15 minutes (for demo purposes, let's do 1-3 minutes)
    const delay = (Math.random() * 2 + 1) * 60 * 1000;

    this.screenshotTimeout = setTimeout(() => {
      this.captureAndUpload();
      this.scheduleNextScreenshot();
    }, delay);
  }

  private captureAndUpload() {
    if (!this.runningTimer || !this.screenStream) return;

    const video = document.createElement('video');
    video.srcObject = this.screenStream;
    video.muted = true; // Required for some browsers to play without interaction

    video.onloadedmetadata = () => {
      video.play().then(() => {
        // Use requestAnimationFrame to ensure a frame is actually rendered before drawing
        requestAnimationFrame(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            this.api.uploadScreenshot(this.runningTimer!.id, dataUrl).subscribe();
          }
          video.pause();
          video.srcObject = null;
        });
      });
    };
  }

  stopTimer() {
    if (!this.runningTimer) return;
    this.api.stopTimer(this.runningTimer.id).subscribe({
      next: (t) => {
        this.runningTimer = null;
        this.entries.unshift(t);
        this.stopScreenStream();
        this.cdr.markForCheck();
      }
    });
  }

  logManualTime() {
    this.api.logManualTime(this.manualEntry).subscribe({
      next: (t) => {
        this.entries.unshift(t);
        this.showManual = false;
        this.manualEntry = { workItemId: null, description: '', startTime: '', endTime: '' };
        this.cdr.markForCheck();
      }
    });
  }

  formatTime(): string {
    if (!this.runningTimer) return '00:00:00';
    const diff = Math.floor((Date.now() - new Date(this.runningTimer.startTime).getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  getTotalHours(): number {
    return this.entries.reduce((sum, e) => sum + e.duration, 0) / 60;
  }

  viewScreenshots(e: TimeEntry) {
    this.viewingEntry = e;
    this.loadingScreenshots = true;
    this.screenshots = [];
    this.api.getScreenshots(e.id).subscribe({
      next: (s) => {
        this.screenshots = s;
        this.loadingScreenshots = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingScreenshots = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.tickInterval);
    this.stopScreenStream();
  }
}
