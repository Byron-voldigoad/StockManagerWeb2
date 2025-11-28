import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SupabaseService, Product } from '../../services/supabase.service';
import { SiteConfigService } from '../../services/site-config.service';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    NavigationComponent,
    PublicLayoutComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = 'Tous';
  searchQuery: string = '';
  selectedPriceRange: string = '';
  isLoading: boolean = true;
  error: string | null = null;

  configService = inject(SiteConfigService);
  logoUrl: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    await this.loadLogo();
    await this.loadData();

    // Écouter les paramètres d'URL pour le filtrage
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
    });
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

  // Filtrage avec plages de prix
  get filteredProducts() {
    return this.products.filter(product => {
      // Filtre par catégorie
      const categoryMatch = this.selectedCategory === 'Tous' || product.category === this.selectedCategory;

      // Filtre par plage de prix
      const priceMatch = this.filterByPriceRange(product.price);

      // Filtre par recherche
      const searchMatch = !this.searchQuery ||
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchQuery.toLowerCase()));

      return categoryMatch && priceMatch && searchMatch;
    });
  }

  // Filtrage par plage de prix
  private filterByPriceRange(price: number): boolean {
    if (!this.selectedPriceRange) return true;

    const range = this.selectedPriceRange;

    if (range === '100000+') {
      return price > 100000;
    }

    const [min, max] = range.split('-').map(Number);
    return price >= min && price <= max;
  }

  // Formater l'affichage de la plage
  getPriceRangeDisplay(): string {
    if (!this.selectedPriceRange) return '';

    if (this.selectedPriceRange === '100000+') {
      return 'Plus de 100 000 FCFA';
    }

    const [min, max] = this.selectedPriceRange.split('-').map(Number);
    return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')} FCFA`;
  }

  // Vérifier si des filtres sont actifs
  get hasActiveFilters(): boolean {
    return this.selectedCategory !== 'Tous' || !!this.selectedPriceRange || !!this.searchQuery;
  }

  // Méthodes de gestion des filtres
  onSearchChange() {
    // La recherche se fait automatiquement via le getter filteredProducts
  }

  onCategoryChange() {
    // Le filtrage se fait automatiquement via le getter filteredProducts
  }

  onPriceChange() {
    // Le filtrage se fait automatiquement via le getter filteredProducts
  }

  // Réinitialiser tous les filtres
  resetFilters() {
    this.selectedCategory = 'Tous';
    this.selectedPriceRange = '';
    this.searchQuery = '';
  }

  // Supprimer des filtres individuels
  removeCategoryFilter() {
    this.selectedCategory = 'Tous';
  }

  removePriceFilter() {
    this.selectedPriceRange = '';
  }

  removeSearchFilter() {
    this.searchQuery = '';
  }

  async loadLogo() {
    const logo = await this.configService.getSetting('site_logo');
    if (logo && logo.trim() !== '') {
      this.logoUrl = logo;
    }
  }

  // Méthode pour formater les prix en FCFA
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}