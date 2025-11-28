import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  @Input() title: string = 'Admin Brocante';
  @Input() subtitle: string = '';
  @Input() icon: 'dashboard' | 'products' | 'categories' | 'settings' | 'media' = 'dashboard';
  @Input() showIcon: boolean = true;

  currentUser: User | null = null;
  private router = inject(Router);
  private authService = inject(SupabaseAuthService);

  constructor() {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.signOut();
  }

  // Méthode pour vérifier si une route est active
  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}