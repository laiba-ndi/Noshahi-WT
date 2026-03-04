import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../models/interfaces';

export interface NotificationAction {
    label: string;
    callback: () => void;
    type?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
    title: string;
    message: string;
    type: 'success' | 'error' | 'welcome' | 'confirm';
    duration?: number;
    actions?: NotificationAction[];
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private notificationsSource = new Subject<Notification | null>();
    notifications$ = this.notificationsSource.asObservable();

    success(title: string, message: string, duration: number = 3000) {
        this.notificationsSource.next({ title, message, type: 'success', duration });
    }

    error(title: string, message: string, duration: number = 5000) {
        this.notificationsSource.next({ title, message, type: 'error', duration });
    }

    welcome(user: User | null) {
        const name = user?.fullName || 'User';
        this.notificationsSource.next({
            title: `Welcome, ${name}!`,
            message: 'Great to see you again. Ready to get some work done?',
            type: 'welcome',
            duration: 4000
        });
    }

    confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
        this.notificationsSource.next({
            title,
            message,
            type: 'confirm',
            actions: [
                { label: 'Cancel', callback: onCancel || (() => this.close()), type: 'secondary' },
                { label: 'Confirm', callback: onConfirm, type: 'danger' }
            ]
        });
    }

    close() {
        this.notificationsSource.next(null);
    }
}
