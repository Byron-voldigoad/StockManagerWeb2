import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService, Product } from '../../services/supabase.service';
import { SiteConfigService } from '../../services/site-config.service';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, NavigationComponent, ProductCardComponent, PublicLayoutComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  isLoading: boolean = true;
  heroImageUrl: string = '';
  settingsLoaded: boolean = false;
  categories: any[] = [];

  configService = inject(SiteConfigService);

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    // ATTENDRE que les settings soient chargés
    await this.waitForSettings();
    await this.loadHeroImage();
    await this.loadCategories();
    await this.loadFeaturedProducts();
  }

  // NOUVELLE méthode pour attendre les settings
  private async waitForSettings(): Promise<void> {
    return new Promise((resolve) => {
      if (this.configService.settingsLoaded.value) {
        resolve();
      } else {
        const subscription = this.configService.settingsLoaded$.subscribe({
          next: (loaded) => {
            if (loaded) {
              console.log('✅ Settings chargés, continuation...');
              subscription.unsubscribe();
              resolve();
            }
          },
          error: (err) => {
            console.error('Erreur attente settings:', err);
            subscription.unsubscribe();
            resolve(); // Continuer même en cas d'erreur
          }
        });

        // Timeout de sécurité
        setTimeout(() => {
          subscription.unsubscribe();
          console.log('⏰ Timeout settings, continuation...');
          resolve();
        }, 5000);
      }
    });
  }

  async loadHeroImage() {
    try {
      const imageUrl = await this.configService.getSetting('hero_image');
      console.log('🎯 HERO IMAGE CHARGÉE:', imageUrl);

      if (imageUrl && imageUrl.trim() !== '') {
        this.heroImageUrl = `url('${imageUrl}')`;
        console.log('✅ Image hero appliquée:', this.heroImageUrl);
      } else {
        this.heroImageUrl = 'linear-gradient(to right, rgb(120 53 15 / 0.8), rgb(146 64 14 / 0.6))';
        console.log('🎨 Fallback gradient appliqué');
      }

      this.settingsLoaded = true;

    } catch (error) {
      console.error('Erreur chargement hero image:', error);
      this.heroImageUrl = 'linear-gradient(to right, rgb(120 53 15 / 0.8), rgb(146 64 14 / 0.6))';
      this.settingsLoaded = true;
    }
  }

  // Méthode simplifiée pour le template
  getHeroBackground(): string {
    return this.heroImageUrl;
  }

  // NOUVEAU : Charger les catégories
  async loadCategories() {
    try {
      this.categories = await this.supabaseService.getCategoriesWithStats();
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  }

  // Helper pour la couleur
  getCategoryColor(colorName: string): string {
    const colors: any = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      teal: 'bg-teal-100 text-teal-600',
      pink: 'bg-pink-100 text-pink-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      gray: 'bg-slate-100 text-slate-600',
    };
    return colors[colorName] || colors['blue'];
  }

  async loadFeaturedProducts() {
    try {
      const products = await this.supabaseService.getProducts();
      this.featuredProducts = products.slice(0, 3);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      this.isLoading = false;
    }
  }
}