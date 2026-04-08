import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const token = 'mock-jwt-token';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenSubject = new BehaviorSubject<string | null>(
        this.getStoredToken()
    );
    public token$: Observable<string | null> = this.tokenSubject.asObservable();

    constructor() {}

    get token(): string | null {
        return this.tokenSubject.value;
    }

    setToken(token: string): void {
        localStorage.setItem('auth_token', token);
        this.tokenSubject.next(token);
    }

    clearToken(): void {
        localStorage.removeItem('auth_token');
        this.tokenSubject.next(null);
    }

    private getStoredToken(): string | null {
        return token;
    }
}