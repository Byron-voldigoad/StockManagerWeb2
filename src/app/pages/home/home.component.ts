import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService, Product } from '../../services/supabase.service';
import { SiteConfigService } from '../../services/site-config.service'; // ← DÉJÀ AJOUTÉ
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
  
  configService = inject(SiteConfigService);

  constructor(
    private supabaseService: SupabaseService,
  ) {}
  
  async ngOnInit() {
    await this.loadFeaturedProducts();
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

  // Méthode pour obtenir l'URL de l'image de fond
  getHeroBackground(): string {
    const heroImage = this.configService.getSetting('hero_image');
    if (heroImage) {
      return `url('${heroImage}')`;
    }
    return 'linear-gradient(to right, rgb(120 53 15 / 0.8), rgb(146 64 14 / 0.6))'; // Fallback ambre
  }
}