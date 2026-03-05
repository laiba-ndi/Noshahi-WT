import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-drive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="drive-container animate-fade-in">
      <div class="drive-header glass-card">
        <div class="header-content">
          <div class="title-group">
            <h1>My Drive</h1>
            <p class="text-secondary text-sm">Securely store and manage your documents</p>
          </div>
          <div class="header-actions">
            <div class="search-bar glass-input">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search files..." [(ngModel)]="searchQuery" (input)="filterFiles()">
            </div>
            <label class="btn btn-primary upload-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Upload New
              <input type="file" (change)="onFileSelected($event)" hidden>
            </label>
          </div>
        </div>
      </div>

      <div class="drive-grid">
        @for (f of filteredFiles; track f.id) {
          <div class="file-card glass-card" (click)="openPreview(f)">
            <div class="file-icon-wrapper" [class]="getFileCategory(f.fileType)">
              <div class="file-icon">
                @if (getFileCategory(f.fileType) === 'image') {
                  <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                } @else if (getFileCategory(f.fileType) === 'pdf') {
                  <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z"/><path d="M14 2v5h5M9 15h6"/></svg>
                } @else {
                  <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M13 2v7h7"/></svg>
                }
              </div>
            </div>
            <div class="file-info">
              <div class="file-name" [title]="f.fileName">{{ f.fileName }}</div>
              <div class="file-meta">
                <span>{{ formatFileSize(f.fileSize) }}</span>
                <span class="dot"></span>
                <span>{{ f.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
            <div class="file-actions" (click)="$event.stopPropagation()">
              <button class="btn-icon-sm" (click)="openPreview(f)" title="Preview">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn-icon-sm" (click)="downloadFile(f)" title="Download">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
              <button class="btn-icon-sm danger" (click)="deleteFile(f)" title="Delete">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        }
        @if (filteredFiles.length === 0 && !loading) {
          <div class="empty-drive full-width">
            <div class="empty-icon">📂</div>
            <h3>No files found</h3>
            <p>Upload your first document or image to get started</p>
          </div>
        }
        @if (loading) {
          <div class="loading-state full-width">
            <div class="spinner"></div>
            <p>Loading your drive...</p>
          </div>
        }
      </div>
    </div>

    <!-- ===== PREVIEW MODAL ===== -->
    @if (previewFile) {
      <div class="preview-overlay" (click)="closePreview()">
        <div class="preview-modal" (click)="$event.stopPropagation()">
          <div class="preview-header">
            <div class="preview-title">
              <div class="preview-icon" [class]="getFileCategory(previewFile.fileType)">
                @if (getFileCategory(previewFile.fileType) === 'image') {
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                } @else if (getFileCategory(previewFile.fileType) === 'pdf') {
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z"/></svg>
                } @else {
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/></svg>
                }
              </div>
              <span>{{ previewFile.fileName }}</span>
            </div>
            <div class="preview-actions">
              <button class="preview-action-btn" (click)="downloadFile(previewFile)" title="Download">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <span class="btn-label">Download</span>
              </button>
              <button class="preview-close-btn" (click)="closePreview()">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div class="preview-body">
            @if (previewLoading) {
              <div class="preview-loading">
                <div class="spinner"></div>
                <p>Loading preview...</p>
              </div>
            } @else if (previewError) {
              <div class="preview-unavailable">
                <div class="preview-unavailable-icon">⚠️</div>
                <h3>Preview unavailable</h3>
                <p>This file type cannot be previewed in the browser.</p>
                <button class="btn btn-primary mt-16" (click)="downloadFile(previewFile!)">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Download Instead
                </button>
              </div>
            } @else if (previewUrl && getFileCategory(previewFile.fileType) === 'image') {
              <div class="preview-image-wrapper">
                <img [src]="previewUrl" [alt]="previewFile.fileName" class="preview-image">
              </div>
            } @else if (safePreviewUrl && getFileCategory(previewFile.fileType) === 'pdf') {
              <iframe [src]="safePreviewUrl" class="preview-iframe" title="PDF Preview"></iframe>
            } @else if (previewUrl) {
              <div class="preview-unavailable">
                <div class="preview-unavailable-icon">📄</div>
                <h3>{{ previewFile.fileName }}</h3>
                <p>{{ formatFileSize(previewFile.fileSize) }} · {{ previewFile.fileType }}</p>
                <button class="btn btn-primary mt-16" (click)="downloadFile(previewFile!)">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Download File
                </button>
              </div>
            }
          </div>

          <div class="preview-footer">
            <span>{{ formatFileSize(previewFile.fileSize) }}</span>
            <span class="dot"></span>
            <span>Uploaded {{ previewFile.createdAt | date:'mediumDate' }}</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .drive-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .drive-header { padding: 32px; border-radius: 24px; }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .title-group h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
    .header-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .search-bar {
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      width: 100%;
      max-width: 300px;
    }
    .search-bar input {
      background: transparent;
      border: none;
      color: white;
      font-size: 14px;
      width: 100%;
    }
    .upload-btn { cursor: pointer; display: flex; align-items: center; gap: 8px; }

    .drive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .full-width { grid-column: 1 / -1; }

    .file-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      cursor: pointer;
    }
    .file-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); }

    .file-icon-wrapper {
      width: 80px; height: 80px; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
      background: rgba(255,255,255,0.05);
      transition: all 0.3s;
    }
    .file-icon-wrapper.pdf   { background: rgba(239,68,68,0.1); color: #ef4444; }
    .file-icon-wrapper.image { background: rgba(16,185,129,0.1); color: #10b981; }
    .file-icon-wrapper.doc   { background: rgba(99,102,241,0.1); color: #818cf8; }
    .file-icon-wrapper.other { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); }

    .file-info { margin-bottom: 16px; width: 100%; }
    .file-name {
      font-weight: 700; font-size: 15px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-bottom: 4px;
    }
    .file-meta {
      font-size: 12px; color: rgba(255,255,255,0.4);
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .dot { width: 4px; height: 4px; background: currentColor; border-radius: 50%; opacity: 0.3; }

    .file-actions { display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; }
    .file-card:hover .file-actions { opacity: 1; }

    .btn-icon-sm {
      width: 32px; height: 32px; border-radius: 10px;
      background: rgba(255,255,255,0.1); color: white; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .btn-icon-sm:hover { background: rgba(255,255,255,0.2); }
    .btn-icon-sm.danger:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

    .empty-drive {
      padding: 80px 20px; text-align: center;
      background: rgba(255,255,255,0.02); border-radius: 24px;
      border: 2px dashed rgba(255,255,255,0.05);
    }
    .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
    .empty-drive h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .empty-drive p { color: rgba(255,255,255,0.4); }

    .loading-state { padding: 60px; text-align: center; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #818cf8; border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== Preview Modal ===== */
    .preview-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(12px);
      z-index: 2000;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: fade-in 0.25s ease;
    }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

    .preview-modal {
      background: linear-gradient(135deg, rgba(15,15,35,0.98) 0%, rgba(35,15,70,0.98) 100%);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 28px;
      width: min(900px, 100%);
      max-height: 90vh;
      display: flex; flex-direction: column;
      overflow: hidden;
      box-shadow: 0 60px 120px -20px rgba(0,0,0,0.9);
      animation: modal-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modal-enter {
      from { transform: scale(0.92) translateY(20px); opacity: 0; }
      to   { transform: scale(1) translateY(0);       opacity: 1; }
    }

    .preview-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      gap: 16px; flex-shrink: 0;
    }
    .preview-title {
      display: flex; align-items: center; gap: 12px;
      font-weight: 700; font-size: 16px;
      min-width: 0; flex: 1;
    }
    .preview-title span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .preview-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .preview-icon.image { background: rgba(16,185,129,0.15); color: #10b981; }
    .preview-icon.pdf   { background: rgba(239,68,68,0.15);  color: #ef4444; }
    .preview-icon.doc   { background: rgba(99,102,241,0.15); color: #818cf8; }
    .preview-icon.other { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }

    .preview-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .preview-action-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px;
      background: rgba(129,140,248,0.15);
      border: 1px solid rgba(129,140,248,0.3);
      border-radius: 12px; color: #a5b4fc;
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .preview-action-btn:hover { background: rgba(129,140,248,0.25); color: #c7d2fe; }
    .preview-close-btn {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .preview-close-btn:hover { background: rgba(239,68,68,0.2); color: #ef4444; border-color: rgba(239,68,68,0.4); }

    .preview-body {
      flex: 1; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.2);
      min-height: 300px;
    }
    .preview-loading { text-align: center; color: rgba(255,255,255,0.5); }
    .preview-loading .spinner { margin-bottom: 12px; }

    .preview-image-wrapper {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      padding: 16px; overflow: auto;
    }
    .preview-image {
      max-width: 100%; max-height: 60vh;
      object-fit: contain; border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .preview-iframe { width: 100%; height: 60vh; border: none; background: white; }

    .preview-unavailable {
      text-align: center; padding: 40px 20px;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .preview-unavailable-icon { font-size: 48px; opacity: 0.5; }
    .preview-unavailable h3 { font-size: 18px; font-weight: 700; }
    .preview-unavailable p { color: rgba(255,255,255,0.4); font-size: 14px; }
    .mt-16 { margin-top: 16px; }

    .preview-footer {
      padding: 14px 24px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 10px;
      font-size: 12px; color: rgba(255,255,255,0.35);
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .header-content { flex-direction: column; align-items: stretch; text-align: center; }
      .search-bar { width: 100%; max-width: 100%; }
      .header-actions { flex-direction: column; }
      .drive-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
      .drive-header { padding: 20px; }
      .preview-overlay { align-items: flex-end; padding: 0; }
      .preview-modal { border-radius: 24px 24px 0 0; max-height: 92vh; width: 100%; }
      .btn-label { display: none; }
    }
  `]
})
export class DriveComponent implements OnInit {
  files: any[] = [];
  filteredFiles: any[] = [];
  searchQuery = '';
  loading = true;

  previewFile: any = null;
  previewUrl: string | null = null;
  safePreviewUrl: SafeResourceUrl | null = null;
  previewLoading = false;
  previewError = false;

  constructor(
    private api: ApiService,
    private notify: NotificationService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  @HostListener('document:keydown.escape')
  onEscape() { this.closePreview(); }

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    this.loading = true;
    this.api.getDriveFiles().subscribe({
      next: (res) => {
        this.files = res;
        this.filterFiles();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notify.error('Error', 'Failed to load drive files');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterFiles() {
    if (!this.searchQuery) {
      this.filteredFiles = [...this.files];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredFiles = this.files.filter(f => f.fileName.toLowerCase().includes(q));
    }
    this.cdr.markForCheck();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.notify.success('Uploading...', `Sending ${file.name} to your drive`);

    this.api.uploadDriveFile(formData).subscribe({
      next: (res) => {
        this.files.unshift(res);
        this.filterFiles();
        this.notify.success('Success', 'File uploaded successfully');
        this.cdr.markForCheck();
      },
      error: () => {
        this.notify.error('Error', 'Upload failed. Please try again.');
      }
    });
  }

  openPreview(file: any) {
    this.previewFile = file;
    this.previewUrl = null;
    this.safePreviewUrl = null;
    this.previewLoading = true;
    this.previewError = false;
    this.cdr.markForCheck();

    this.api.viewDriveFile(file.id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.previewUrl = objectUrl;
        // For PDF iframes we need to bypass Angular's sanitizer
        if (this.getFileCategory(file.fileType) === 'pdf') {
          this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        }
        this.previewLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.previewLoading = false;
        this.previewError = true;
        this.cdr.markForCheck();
      }
    });
  }

  closePreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewFile = null;
    this.previewUrl = null;
    this.safePreviewUrl = null;
    this.previewError = false;
    this.cdr.markForCheck();
  }

  downloadFile(file: any) {
    this.api.downloadDriveFile(file.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('Error', 'Download failed')
    });
  }

  deleteFile(file: any) {
    if (confirm(`Are you sure you want to delete "${file.fileName}"?`)) {
      this.api.deleteDriveFile(file.id).subscribe({
        next: () => {
          this.files = this.files.filter(f => f.id !== file.id);
          this.filterFiles();
          this.notify.success('Deleted', 'File removed from drive');
          this.cdr.markForCheck();
        },
        error: () => this.notify.error('Error', 'Delete failed')
      });
    }
  }

  getFileCategory(type: string): string {
    if (type.includes('image')) return 'image';
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('officedocument') || type.includes('msword')) return 'doc';
    return 'other';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
