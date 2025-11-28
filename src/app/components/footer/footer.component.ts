import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteConfigService } from '../../services/site-config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  configService = inject(SiteConfigService);
  
  // NOUVEAU: URL du logo dynamique
  logoUrl: string = '';
  async ngOnInit() {
    await this.loadLogo();
  }

  async loadLogo() {
    const logo = await this.configService.getSetting('site_logo');
    if (logo && logo.trim() !== '') {
      this.logoUrl = logo;
    }
  }
  currentYear = new Date().getFullYear();
}
