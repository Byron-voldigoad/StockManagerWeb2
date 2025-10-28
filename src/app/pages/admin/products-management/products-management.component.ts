import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService, Product } from '../../../services/supabase.service';
import { AdminLayoutComponent } from '../../../layouts/admin-layout.component';
import {ProductFormComponent} from '../../../components/admin/product-form/product-form.component';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,AdminLayoutComponent,ProductFormComponent],
  templateUrl: './products-management.component.html',
  styleUrls: ['./products-management.component.css']
})
export class ProductsManagementComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  
  searchQuery: string = '';
  selectedCategory: string = 'Tous';
  sortBy: string = 'newest';
  
  isLoading: boolean = true;
  showAddForm: boolean = false;
  editingProduct: Product | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    
    try {
      const [products, categories] = await Promise.all([
        this.supabaseService.getProducts(),
        this.supabaseService.getCategories()
      ]);
      
      this.products = products;
      this.categories = categories.filter(cat => cat !== 'Tous');
      this.applyFilters();
      
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let filtered = this.products;

    // Filtre par recherche
    if (this.searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'Tous') {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Tri
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  sortProducts(products: Product[]): Product[] {
    switch (this.sortBy) {
      case 'newest':
        return [...products].sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      case 'oldest':
        return [...products].sort((a, b) => 
          new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        );
      case 'price_asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price_desc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return products;
    }
  }

  getStockBadgeClass(quantity: number): string {
    if (quantity === 0) return 'px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm';
    if (quantity < 5) return 'px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm';
    return 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm';
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.showAddForm = true;
  }

  // Gestion du formulaire
onProductSaved(product: Product) {
  this.showAddForm = false;
  this.editingProduct = null;
  this.loadData(); // Recharger la liste
}

onFormCancelled() {
  this.showAddForm = false;
  this.editingProduct = null;
}

// Modifie aussi la méthode deleteProduct pour utiliser Supabase
async deleteProduct(product: Product) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`)) {
    try {
      const success = await this.supabaseService.deleteProduct(product.id!);
      if (success) {
        await this.loadData(); // Recharger la liste
      } else {
        alert('Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }
}
}