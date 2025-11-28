import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SiteConfigService } from '../../services/site-config.service'; // ← AJOUT
import { Location } from '@angular/common';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';
import { PriceSpacePipe } from '../../pipes/price-space.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent, // ← AJOUT
    NavigationComponent,
    PublicLayoutComponent,
    // Pipe pour formater les prix
    PriceSpacePipe,
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  error: string | null = null;
  selectedImageIndex: number = 0; // Index de l'image sélectionnée dans la galerie
  relatedProducts: Product[] = []; // Produits similaires

  // AJOUT: Injection du service de configuration
  configService = inject(SiteConfigService);

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private location: Location,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.getProduct();
  }

  async getProduct(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.isLoading = true;
    this.error = null;

    try {
      const product = await this.supabaseService.getProductById(id);

      if (product) {
        this.product = product;
        console.log('Produit chargé:', product);

        // Charger les produits similaires
        this.loadRelatedProducts(product.category, product.id);
      } else {
        this.error = 'Produit non trouvé';
        setTimeout(() => this.router.navigate(['/produits']), 2000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      this.error = 'Erreur de chargement';
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.location.back();
  }

  // Méthodes pour la galerie d'images
  getProductImages(): string[] {
    if (!this.product) return [];
    const images: string[] = [this.product.image];
    if (this.product.image2) images.push(this.product.image2);
    if (this.product.image3) images.push(this.product.image3);
    return images;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  nextImage(): void {
    const images = this.getProductImages();
    this.selectedImageIndex = (this.selectedImageIndex + 1) % images.length;
  }

  previousImage(): void {
    const images = this.getProductImages();
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + images.length) % images.length;
  }

  getCurrentImage(): string {
    const images = this.getProductImages();
    return images[this.selectedImageIndex] || '';
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  showInterest(): void {
    if (this.product) {
      // Récupérer le numéro WhatsApp depuis la config
      const whatsappNumber =
        this.configService.getSetting('whatsapp_number') || '655596702';

      // Nettoyer le numéro (supprimer espaces, tirets, caractères spéciaux)
      const cleanNumber = whatsappNumber.replace(/\D/g, '');

      // Créer le message avec les infos du produit (sans URL d'image en text)
      const productMessage = `Bonjour \n\nJe suis intéressé(e) par ce produit :\n\n *${this.product.name}*\n Prix : ${this.product.price} FCFA\n Catégorie : ${this.product.category}\n\n Description :\n${this.product.description}\n\nPouvez-vous me fournir plus d'informations ?`;

      // Encoder le message pour l'URL
      const encodedMessage = encodeURIComponent(productMessage);

      // Créer le lien WhatsApp avec le numéro au format international
      // Format : wa.me/[numéro sans + ni espaces]
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

      // Copier l'URL de l'image dans le presse-papiers
      if (this.product.image) {
        navigator.clipboard.writeText(this.product.image).catch((err) => {
          console.error("Erreur lors de la copie de l'URL:", err);
        });
      }

      // Rediriger vers WhatsApp
      window.open(whatsappUrl, '_blank');

      // Afficher un toast ou une notification
      setTimeout(() => {
        alert(
          "📋 L'URL de l'image a été copiée dans votre presse-papiers. Vous pouvez la coller dans WhatsApp pour partager la photo du produit."
        );
      }, 500);
    }
  }
  async loadRelatedProducts(category: string, currentProductId: number) {
    this.relatedProducts = await this.supabaseService.getProductsByCategory(category, 4, currentProductId);
  }
}
