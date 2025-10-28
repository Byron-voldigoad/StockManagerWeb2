import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';
import { SiteConfigService } from '../../services/site-config.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    NavigationComponent, 
    PublicLayoutComponent
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  configService = inject(SiteConfigService);

  // Méthode qui retourne directement les horaires formatés
  getFormattedOpeningHours(): { day: string; hours: string; isClosed?: boolean }[] {
    const hours = this.configService.getSetting('opening_hours');
    let hoursObj: any = {};
    
    try {
      if (typeof hours === 'object' && hours !== null) {
        hoursObj = hours;
      } else if (typeof hours === 'string') {
        hoursObj = JSON.parse(hours);
      } else {
        // Fallback par défaut avec vos horaires
        hoursObj = {
          'lundi': '8h - 18h',
          'mardi': '8h - 18h', 
          'mercredi': '8h - 18h',
          'jeudi': '8h - 18h',
          'vendredi': '8h - 18h',
          'samedi': '8h - 18h',
          'dimanche': 'Fermé'
        };
      }
    } catch (error) {
      // Fallback en cas d'erreur
      hoursObj = {
        'lundi': '8h - 18h',
        'mardi': '8h - 18h', 
        'mercredi': '8h - 18h',
        'jeudi': '8h - 18h',
        'vendredi': '8h - 18h',
        'samedi': '8h - 18h',
        'dimanche': 'Fermé'
      };
    }

    // Transformer en tableau formaté avec gestion du "Fermé"
    return Object.entries(hoursObj).map(([key, value]) => ({
      day: this.formatDay(key),
      hours: value as string,
      isClosed: (value as string).toLowerCase().includes('ferm') || (value as string).toLowerCase().includes('closed')
    }));
  }

  // Méthode pour formater les jours
  private formatDay(dayKey: string): string {
    const days: { [key: string]: string } = {
      'lundi': 'Lundi',
      'mardi': 'Mardi', 
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche',
      'lundi_vendredi': 'Lundi - Vendredi' // Garder pour compatibilité
    };
    return days[dayKey] || dayKey.replace('_', ' ');
  }
}