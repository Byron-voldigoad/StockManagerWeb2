import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  @Input() showIcon: boolean = true;

  currentUser: User | null = null;

  constructor(private authService: SupabaseAuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.signOut();
  }
}