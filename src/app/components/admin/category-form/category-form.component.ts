import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

interface Category {
  id: number;
  name: string;
  color: string;
  product_count: number;
  created_at: string;
}

interface CategoryFormData {
  name: string;
  color: string;
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

  formData: CategoryFormData = {
    name: '',
    color: 'amber'
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
        color: this.category.color
      };
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      color: 'amber'
    };
    this.error = '';
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
        // Modification
        success = await this.supabaseService.updateCategory(
          this.category.id,
          this.formData.name.trim(),
          this.formData.color
        );
      } else {
        // Création
        success = await this.supabaseService.createCategory(
          this.formData.name.trim(),
          this.formData.color
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