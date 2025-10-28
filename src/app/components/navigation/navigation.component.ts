import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SiteConfigService } from '../../services/site-config.service'; // ← AJOUT

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule], // ← AJOUT CommonModule
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  // AJOUT: Service de configuration
  configService = inject(SiteConfigService);
}