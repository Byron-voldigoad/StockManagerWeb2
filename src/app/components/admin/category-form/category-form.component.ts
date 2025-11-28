import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

interface Category {
  id: number;
  name: string;
  color: string;
  product_count: number;
  description?: string; // ← AJOUT
  created_at: string;
}

// CORRIGÉ : Ajouter description dans l'interface du formulaire
interface CategoryFormData {
  name: string;
  color: string;
  description: string; // ← AJOUT
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnChanges {
  @Input() category: Category | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // CORRIGÉ : Ajouter description dans formData
  formData: CategoryFormData = {
    name: '',
    color: 'amber',
    description: '' // ← AJOUT
  };

  availableColors: string[] = [
    'rouge', 'orange', 'jaune', 'vert', 'bleu', 
    'violet', 'rose', 'marron', 'noir', 'gris',
    'turquoise', 'corail', 'lavande', 'menthe', 'saumon',
    'ocre', 'bordeaux', 'kaki', 'cyan', 'magenta'
  ];

  isLoading: boolean = false;
  error: string = '';

  ngOnChanges() {
    if (this.category) {
      this.formData = {
        name: this.category.name,
        color: this.category.color,
        description: this.category.description || '' // ← AJOUT
      };
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      color: 'amber',
      description: '' // ← AJOUT
    };
    this.error = '';
  }

  getColorClass(color: string): { background: string; text: string } {
    const colorMap: { [key: string]: { background: string; text: string } } = {
      'rouge': { background: '#fecaca', text: '#dc2626' },
      'orange': { background: '#fdba74', text: '#ea580c' },
      'jaune': { background: '#fde047', text: '#ca8a04' },
      'vert': { background: '#86efac', text: '#16a34a' },
      'bleu': { background: '#93c5fd', text: '#2563eb' },
      'violet': { background: '#d8b4fe', text: '#9333ea' },
      'rose': { background: '#f9a8d4', text: '#db2777' },
      'marron': { background: '#d6d3d1', text: '#78350f' },
      'noir': { background: '#9ca3af', text: '#000000' },
      'gris': { background: '#d1d5db', text: '#374151' },
      'turquoise': { background: '#5eead4', text: '#0f766e' },
      'corail': { background: '#fda4af', text: '#e11d48' },
      'lavande': { background: '#c4b5fd', text: '#7c3aed' },
      'menthe': { background: '#6ee7b7', text: '#059669' },
      'saumon': { background: '#fca5a5', text: '#b91c1c' },
      'ocre': { background: '#fcd34d', text: '#d97706' },
      'bordeaux': { background: '#fda4af', text: '#991b1b' },
      'kaki': { background: '#a3e635', text: '#65a30d' },
      'cyan': { background: '#67e8f9', text: '#0891b2' },
      'magenta': { background: '#f0abfc', text: '#c026d3' }
    };

    return colorMap[color] || colorMap['bleu'];
  }

  async onSubmit() {
    // Validation
    if (!this.formData.name.trim()) {
      this.error = 'Le nom de la catégorie est obligatoire';
      return;
    }

    if (this.formData.name.trim().length > 50) {
      this.error = 'Le nom ne peut pas dépasser 50 caractères';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      let success: boolean;

      if (this.category) {
        // CORRIGÉ : Modification avec description
        success = await this.supabaseService.updateCategory(
          this.category.id,
          this.formData.name.trim(),
          this.formData.color,
          this.formData.description.trim() // ← AJOUT
        );
      } else {
        // CORRIGÉ : Création avec description
        success = await this.supabaseService.createCategory(
          this.formData.name.trim(),
          this.formData.color,
          this.formData.description.trim() // ← AJOUT
        );
      }

      if (success) {
        this.saved.emit();
        this.resetForm();
      } else {
        this.error = this.category 
          ? 'Erreur lors de la modification de la catégorie' 
          : 'Erreur lors de la création de la catégorie';
      }

    } catch (error) {
      console.error('Erreur formulaire catégorie:', error);
      this.error = 'Une erreur est survenue';
    } finally {
      this.isLoading = false;
    }
  }

  onCancel() {
    this.resetForm();
    this.cancelled.emit();
  }

  constructor(private supabaseService: SupabaseService) {}
}