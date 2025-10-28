import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';
import { SupabaseService, Product } from '../../../services/supabase.service';
import { User } from '@supabase/supabase-js';
import { AdminLayoutComponent } from '../../../layouts/admin-layout.component';

interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  totalCategories: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,AdminLayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: DashboardStats = {
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    totalCategories: 0
  };
  recentProducts: Product[] = [];
  isLoading = true;

  constructor(
    private authService: SupabaseAuthService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      const products = await this.supabaseService.getProducts();
      const categories = await this.supabaseService.getCategories();

      // Calculer les statistiques
      this.stats = {
        totalProducts: products.length,
        totalStock: products.reduce((sum, product) => sum + product.quantity, 0),
        totalValue: products.reduce((sum, product) => sum + (product.price * product.quantity), 0),
        totalCategories: categories.length - 1 // -1 pour "Tous"
      };

      // Produits récents (5 derniers)
      this.recentProducts = products.slice(0, 5);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.signOut();
  }
}