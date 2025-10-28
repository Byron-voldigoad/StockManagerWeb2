import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product } from '../../../services/supabase.service';

interface ProductFormData {
  name: string;
  category: string;
  price: number | null;
  quantity: number | null;
  image: string;
  description: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnChanges {
  @Input() editingProduct: Product | null = null;
  @Input() categories: string[] = [];
  @Input() showForm: boolean = false;
  
  @Output() saved = new EventEmitter<Product>();
  @Output() cancelled = new EventEmitter<void>();

  formData: ProductFormData = {
    name: '',
    category: '',
    price: null,
    quantity: null,
    image: '',
    description: ''
  };

  selectedFile: File | null = null;
  isLoading: boolean = false;
  error: string = '';

  ngOnChanges() {
    if (this.editingProduct) {
      // Remplir le formulaire avec les données du produit à modifier
      this.formData = {
        name: this.editingProduct.name,
        category: this.editingProduct.category,
        price: this.editingProduct.price,
        quantity: this.editingProduct.quantity,
        image: this.editingProduct.image,
        description: this.editingProduct.description
      };
    } else {
      // Réinitialiser le formulaire pour un nouvel ajout
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      category: '',
      price: null,
      quantity: null,
      image: '',
      description: ''
    };
    this.selectedFile = null;
    this.error = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.error = 'Veuillez sélectionner une image valide';
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'L\'image ne doit pas dépasser 5MB';
        return;
      }

      this.selectedFile = file;
      this.error = '';

      // Aperçu local de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    // Validation
    if (!this.formData.name || !this.formData.category || 
        !this.formData.price || !this.formData.quantity) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.formData.price < 0) {
      this.error = 'Le prix ne peut pas être négatif';
      return;
    }

    if (this.formData.quantity < 0) {
      this.error = 'La quantité ne peut pas être négative';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      let imageUrl = this.formData.image;

      // Upload de l'image si un fichier est sélectionné
      if (this.selectedFile) {
        const uploadedUrl = await this.supabaseService.uploadProductImage(this.selectedFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Préparer les données
      const productData = {
        ...this.formData,
        image: imageUrl,
        price: Number(this.formData.price),
        quantity: Number(this.formData.quantity)
      };

      let result: Product | null;

      if (this.editingProduct) {
        // Modification
        result = await this.supabaseService.updateProduct(this.editingProduct.id!, productData);
      } else {
        // Création
        result = await this.supabaseService.createProduct(productData);
      }

      if (result) {
        this.saved.emit(result);
        this.resetForm();
      } else {
        this.error = 'Erreur lors de la sauvegarde du produit';
      }

    } catch (error) {
      console.error('Erreur formulaire:', error);
      this.error = 'Une erreur est survenue lors de la sauvegarde';
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