import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SupabaseService, Product } from '../../services/supabase.service';
import { SiteConfigService } from '../../services/site-config.service'; // ← AJOUT
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, NavigationComponent, PublicLayoutComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = 'Tous';
  searchQuery: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  
  // AJOUT: Injection du service de configuration
  configService = inject(SiteConfigService);

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const [products, categories] = await Promise.all([
        this.supabaseService.getProducts(),
        this.supabaseService.getCategories()
      ]);
      
      this.products = products;
      this.categories = categories;
    } catch (error) {
      console.error('Erreur chargement:', error);
      this.error = 'Impossible de charger les produits. Vérifiez votre connexion.';
    } finally {
      this.isLoading = false;
    }
  }

  async selectCategory(category: string) {
    this.selectedCategory = category;
  }

  get filteredProducts() {
    if (this.selectedCategory === 'Tous') {
      return this.products;
    }
    return this.products.filter(product => 
      product.category === this.selectedCategory
    );
  }
}