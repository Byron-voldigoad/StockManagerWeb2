import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { CategoryFormComponent } from '../../../components/admin/category-form/category-form.component';
import { AdminLayoutComponent } from '../../../layouts/admin-layout.component';

interface Category {
  id: number;
  name: string;
  color: string;
  product_count: number;
  created_at: string;
}

@Component({
  selector: 'app-categories-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CategoryFormComponent,
    AdminLayoutComponent,
  ],
  templateUrl: './categories-management.component.html',
  styleUrls: ['./categories-management.component.css'],
})
export class CategoriesManagementComponent implements OnInit {
  categories: Category[] = [];
  editingCategory: Category | null = null;
  showForm: boolean = false;
  isLoading: boolean = true;

  // Statistiques
  totalProducts: number = 0;
  avgProductsPerCategory: number = 0;
  mostUsedColor: string = '';

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.isLoading = true;
    try {
      this.categories = await this.supabaseService.getCategoriesWithStats();
      this.calculateStats();
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      this.isLoading = false;
    }
  }

  calculateStats() {
    // Total produits
    this.totalProducts = this.categories.reduce(
      (sum, cat) => sum + cat.product_count,
      0
    );

    // Moyenne produits par catégorie
    this.avgProductsPerCategory =
      this.categories.length > 0
        ? this.totalProducts / this.categories.length
        : 0;

    // Couleur la plus utilisée
    const colorCounts = this.categories.reduce((acc, cat) => {
      acc[cat.color] = (acc[cat.color] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    this.mostUsedColor = Object.keys(colorCounts).reduce(
      (a, b) => (colorCounts[a] > colorCounts[b] ? a : b),
      'amber'
    );
  }

  getColorClass(color: string): { background: string; text: string } {
  const colorMap: { [key: string]: { background: string; text: string } } = {
    // Couleurs VIVES et SATURÉES
    'rouge': { background: '#fecaca', text: '#dc2626' },        // Rouge vif
    'orange': { background: '#fdba74', text: '#ea580c' },       // Orange intense
    'jaune': { background: '#fde047', text: '#ca8a04' },        // Jaune éclatant
    'vert': { background: '#86efac', text: '#16a34a' },         // Vert frais
    'bleu': { background: '#93c5fd', text: '#2563eb' },         // Bleu vif
    'violet': { background: '#d8b4fe', text: '#9333ea' },       // Violet riche
    'rose': { background: '#f9a8d4', text: '#db2777' },         // Rose flashy
    
    // Couleurs FORTES et DISTINCTES
    'marron': { background: '#d6d3d1', text: '#78350f' },       // Marron chaleureux
    'noir': { background: '#9ca3af', text: '#000000' },         // Noir profond
    'gris': { background: '#d1d5db', text: '#374151' },         // Gris contrasté
    
    // Couleurs ÉCLATANTES supplémentaires
    'turquoise': { background: '#5eead4', text: '#0f766e' },    // Turquoise vibrant
    'corail': { background: '#fda4af', text: '#e11d48' },       // Corail intense
    'lavande': { background: '#c4b5fd', text: '#7c3aed' },      // Lavande profond
    'menthe': { background: '#6ee7b7', text: '#059669' },       // Menthe fraîche
    'saumon': { background: '#fca5a5', text: '#b91c1c' },       // Saumon vif
    'ocre': { background: '#fcd34d', text: '#d97706' },         // Ocre doré
    'bordeaux': { background: '#fda4af', text: '#991b1b' },     // Bordeaux riche
    'kaki': { background: '#a3e635', text: '#65a30d' },         // Kaki éclatant
    'cyan': { background: '#67e8f9', text: '#0891b2' },         // Cyan électrique
    'magenta': { background: '#f0abfc', text: '#c026d3' },      // Magenta vibrant
    'émeraude': { background: '#34d399', text: '#047857' },     // Émeraude brillant
    'saphir': { background: '#60a5fa', text: '#1d4ed8' },       // Saphir intense
    'rubis': { background: '#fb7185', text: '#be123c' },        // Rubis éclatant
    'or': { background: '#fcd34d', text: '#d97706' },           // Or brillant
    'argent': { background: '#e5e7eb', text: '#6b7280' }        // Argent métallique
  };

  return colorMap[color] || colorMap['bleu']; // Fallback sur bleu
}

  showCategoryForm() {
    this.editingCategory = null;
    this.showForm = true;
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.showForm = true;
  }

  async deleteCategory(category: Category) {
    if (category.product_count > 0) {
      alert(
        `Impossible de supprimer "${category.name}" : ${category.product_count} produit(s) utilisent cette catégorie.`
      );
      return;
    }

    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`
      )
    ) {
      const result = await this.supabaseService.deleteCategory(category.id);

      if (result.success) {
        await this.loadCategories();
      } else {
        alert(result.message || 'Erreur lors de la suppression');
      }
    }
  }

  onCategorySaved() {
    this.showForm = false;
    this.editingCategory = null;
    this.loadCategories();
  }

  onFormCancelled() {
    this.showForm = false;
    this.editingCategory = null;
  }
}
