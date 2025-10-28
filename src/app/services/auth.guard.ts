import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseAuthService } from './supabase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: SupabaseAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/admin/login']);
      return false;
    }
  }
}