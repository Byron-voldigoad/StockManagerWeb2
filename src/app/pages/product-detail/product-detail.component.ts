import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
import { SiteConfigService } from '../../services/site-config.service'; // ← AJOUT
import { Location } from '@angular/common';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavigationComponent, PublicLayoutComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  error: string | null = null;
  
  // AJOUT: Injection du service de configuration
  configService = inject(SiteConfigService);

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private location: Location,
    private router: Router
  ) {}

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

  showInterest(): void {
    if (this.product) {
      // MODIFICATION: Message dynamique
      const message = this.configService.getSetting('interest_message') 
        || `Merci pour votre intérêt pour "${this.product.name}" ! Contactez-nous pour plus d'informations.`;
      alert(message);
    }
  }
}