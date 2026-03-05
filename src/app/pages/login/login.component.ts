import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
      </div>

      <div class="login-container animate-slide-up">
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="url(#g1)" stroke="url(#g1)" stroke-width="1.5"/><defs><linearGradient id="g1" x1="4" y1="3" x2="20" y2="21"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs></svg>
            </div>
            <span class="logo-text">Noshahi TeamWork</span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
              placeholder="you&#64;company.com" required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password"
              placeholder="••••••••" required>
          </div>

          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }

          <button type="submit" class="btn btn-primary w-full login-btn" [disabled]="loading">
            @if (loading) {
              <div class="spinner"></div>
            } @else {
              Sign In
            }
          </button>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .login-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.4;
    }
    .orb-1 { width: 500px; height: 500px; background: #6366f1; top: -10%; left: -10%; }
    .orb-2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -10%; right: -10%; }
    .orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 40%; left: 50%; }
    .login-container {
      position: relative;
      z-index: 1;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(40px);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 40px;
      width: 420px;
      box-shadow: var(--shadow-lg);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      background: var(--gradient-primary);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .login-header p {
      color: var(--text-secondary);
      font-size: 14px;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .login-btn {
      height: 46px;
      font-size: 15px;
      font-weight: 600;
      justify-content: center;
      margin-top: 4px;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #f87171;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }
    .demo-accounts {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .demo-accounts > p {
      text-align: center;
      font-size: 12px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .demo-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .demo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--bg-glass);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      cursor: pointer;
      font-family: inherit;
      font-size: 13px;
      transition: all var(--transition-fast);
    }
    .demo-item:hover {
      background: var(--bg-glass-hover);
      color: var(--text-primary);
    }
    .demo-role {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .demo-role.admin { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }
    .demo-role.manager { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
    .demo-role.employee { background: rgba(16, 185, 129, 0.15); color: #059669; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  fillDemo(type: string) {
    const accounts: Record<string, { email: string, password: string }> = {
      admin: { email: 'admin@noshahi.com', password: 'Admin@123' },
      manager: { email: 'manager@noshahi.com', password: 'Manager@123' },
      employee: { email: 'employee@noshahi.com', password: 'Employee@123' }
    };
    this.email = accounts[type].email;
    this.password = accounts[type].password;
  }

  login() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.notification.welcome(res.user);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
        this.notification.error('Login Failed', this.error);
      }
    });
  }
}
