import { Component, inject, OnInit } from '@angular/core';
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
export class NavigationComponent implements OnInit {
  configService = inject(SiteConfigService);
  
  // NOUVEAU: URL du logo dynamique
  logoUrl: string = '';
  
  // État du menu mobile
  isMobileMenuOpen = false;

  async ngOnInit() {
    // Charger le logo au démarrage
    await this.loadLogo();
  }

  // NOUVEAU: Charger le logo depuis les settings
  async loadLogo() {
    const logo = await this.configService.getSetting('site_logo');
    if (logo && logo.trim() !== '') {
      this.logoUrl = logo;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}