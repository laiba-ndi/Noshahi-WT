import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
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
              </div>
            </div>
          }
          @if (entries.length === 0) {
            <div class="empty-state" style="padding:30px">No time entries yet</div>
          }
        </div>
      </div>
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
  `]
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  runningTimer: TimeEntry | null = null;
  entries: TimeEntry[] = [];
  workItems: WorkItem[] = [];
  showManual = false;
  newTimer: any = { workItemId: null, description: '' };
  manualEntry: any = { workItemId: null, description: '', startTime: '', endTime: '' };
  private tickInterval: any;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

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

  startTimer() {
    this.api.startTimer(this.newTimer.workItemId, this.newTimer.description).subscribe({
      next: (t) => {
        this.runningTimer = t;
        this.newTimer = { workItemId: null, description: '' };
        this.cdr.markForCheck();
      }
    });
  }

  stopTimer() {
    if (!this.runningTimer) return;
    this.api.stopTimer(this.runningTimer.id).subscribe({
      next: (t) => {
        this.runningTimer = null;
        this.entries.unshift(t);
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

  ngOnDestroy() { clearInterval(this.tickInterval); }
}
