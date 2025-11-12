import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product } from '../../../services/supabase.service';

interface ProductFormData {
  name: string;
  category: string;
  price: number | null;
  quantity: number | null;
  image: string;
  image2?: string;
  image3?: string;
  description: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
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
    description: '',
  };

  selectedFile: File | null = null;
  selectedFile2: File | null = null;
  selectedFile3: File | null = null;
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
        description: this.editingProduct.description,
        image2: (this.editingProduct.image2 as any) || '',
        image3: (this.editingProduct.image3 as any) || '',
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
      image2: '',
      image3: '',
      description: '',
    };
    this.selectedFile = null;
    this.selectedFile2 = null;
    this.selectedFile3 = null;
    this.error = '';
  }

  // Gestionnaire de fichier réutilisable pour image, image2 et image3
  onFileSelected(event: any, field: 'image' | 'image2' | 'image3' = 'image') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner une image valide';
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = "L'image ne doit pas dépasser 5MB";
      return;
    }

    // Assigner le fichier au champ correspondant
    if (field === 'image') this.selectedFile = file;
    if (field === 'image2') this.selectedFile2 = file;
    if (field === 'image3') this.selectedFile3 = file;

    this.error = '';

    // Aperçu local de l'image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      (this.formData as any)[field] = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async onSubmit() {
    // Validation
    if (
      !this.formData.name ||
      !this.formData.category ||
      !this.formData.price ||
      !this.formData.quantity
    ) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (!this.selectedFile && !this.editingProduct) {
      this.error = 'Veuillez sélectionner une image pour le produit';
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
      // Préparer et uploader les images sélectionnées
      // Conserver les images existantes si on édite et qu'on ne fournit pas de nouveau fichier
      let imageUrl = this.editingProduct?.image || '';
      let image2Url: string | null = this.editingProduct?.image2 || null;
      let image3Url: string | null = this.editingProduct?.image3 || null;

      // Upload image principale si un fichier local est sélectionné
      if (this.selectedFile) {
        const uploadedUrl = await this.supabaseService.uploadProductImage(
          this.selectedFile
        );
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      // Upload image2
      if (this.selectedFile2) {
        const uploadedUrl2 = await this.supabaseService.uploadProductImage(
          this.selectedFile2
        );
        if (uploadedUrl2) image2Url = uploadedUrl2;
      }

      // Upload image3
      if (this.selectedFile3) {
        const uploadedUrl3 = await this.supabaseService.uploadProductImage(
          this.selectedFile3
        );
        if (uploadedUrl3) image3Url = uploadedUrl3;
      }

      // Préparer les données (inclure image2 et image3 si fournis)
      const productData = {
        ...this.formData,
        image: imageUrl,
        image2: image2Url || null,
        image3: image3Url || null,
        price: Number(this.formData.price),
        quantity: Number(this.formData.quantity),
      };

      console.log('Données à sauvegarder:', productData);

      let result: Product | null;

      if (this.editingProduct) {
        // Modification
        result = await this.supabaseService.updateProduct(
          this.editingProduct.id!,
          productData
        );
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
