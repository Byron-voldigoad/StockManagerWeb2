import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private readonly ADMIN_USERNAME = 'admin';
  private readonly ADMIN_PASSWORD = 'brocante2024';

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      this.isAuthenticated = true;
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/admin/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated || localStorage.getItem('isAdmin') === 'true';
  }
}