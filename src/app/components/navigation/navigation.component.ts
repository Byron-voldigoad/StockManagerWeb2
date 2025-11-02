import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SiteConfigService } from '../../services/site-config.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  configService = inject(SiteConfigService);
  
  // NOUVEAU: État du menu mobile
  isMobileMenuOpen = false;

  // NOUVEAU: Méthode pour toggle le menu mobile
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // NOUVEAU: Fermer le menu après navigation
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}