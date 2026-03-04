import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    {
        path: '',
        loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'projects', loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent) },
            { path: 'board', loadComponent: () => import('./pages/board/board.component').then(m => m.BoardComponent) },
            { path: 'tasks', loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent) },
            { path: 'time-tracking', loadComponent: () => import('./pages/time-tracking/time-tracking.component').then(m => m.TimeTrackingComponent) },
            { path: 'reports', loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent) },
            { path: 'team', loadComponent: () => import('./pages/team/team.component').then(m => m.TeamComponent), canActivate: [adminGuard] },
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
