import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUser();
    }

    private loadUser() {
        const userData = localStorage.getItem('tw_user');
        if (userData) {
            this.currentUserSubject.next(JSON.parse(userData));
        }
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
            tap(res => {
                localStorage.setItem('tw_token', res.token);
                localStorage.setItem('tw_user', JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    register(fullName: string, email: string, password: string, role?: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { fullName, email, password, role }).pipe(
            tap(res => {
                localStorage.setItem('tw_token', res.token);
                localStorage.setItem('tw_user', JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    logout() {
        localStorage.removeItem('tw_token');
        localStorage.removeItem('tw_user');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('tw_token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    hasRole(role: string): boolean {
        return this.currentUserSubject.value?.role === role;
    }

    isAdminOrManager(): boolean {
        const role = this.currentUserSubject.value?.role;
        return role === 'Admin' || role === 'Manager';
    }
}
