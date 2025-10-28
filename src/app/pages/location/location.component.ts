import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';
import { SiteConfigService } from '../../services/site-config.service';

// Installation correcte de Leaflet
import * as L from 'leaflet';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, NavigationComponent, PublicLayoutComponent],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit, AfterViewInit {
  configService = inject(SiteConfigService);
  
  private map: any;
  
  // Coordonnées de Yaoundé (Tropicana)
  brocanteLocation = {
    lat: 3.8480,    // Yaoundé
    lng: 11.5021,   // Yaoundé
    address: 'Tropicana, Yaoundé, Cameroun'
  };

  transportInfo = {
    userLocation: null as { lat: number; lng: number } | null,
    distance: '',
    duration: '',
    directions: ''
  };

  isLoadingLocation = false;

  ngOnInit() {
    this.loadBrocanteLocation();
  }

  ngAfterViewInit() {
    // Initialiser la carte après que la vue soit rendue
    setTimeout(() => this.initMap(), 100);
  }

  private loadBrocanteLocation() {
    // Charger la localisation depuis la configuration
    const locationConfig = this.configService.getSetting('brocante_location');
    if (locationConfig && typeof locationConfig === 'object') {
      this.brocanteLocation = { ...this.brocanteLocation, ...locationConfig };
    } else if (typeof locationConfig === 'string') {
      try {
        const parsed = JSON.parse(locationConfig);
        this.brocanteLocation = { ...this.brocanteLocation, ...parsed };
      } catch (e) {
        console.error('Erreur parsing location:', e);
      }
    }
  }

  private initMap() {
    try {
      // Créer la carte
      this.map = L.map('map').setView([this.brocanteLocation.lat, this.brocanteLocation.lng], 15);

      // Ajouter les tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Icône personnalisée pour éviter les problèmes
      const customIcon = L.divIcon({
        html: '🏺',
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      // Marqueur de la brocante
      L.marker([this.brocanteLocation.lat, this.brocanteLocation.lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(`
          <div class="text-center">
            <strong>${this.configService.getSetting('site_name') || 'La Brocante'}</strong><br>
            ${this.brocanteLocation.address}
          </div>
        `)
        .openPopup();

      console.log('Carte Leaflet initialisée avec succès');

      // Détection de la localisation
      this.detectUserLocation();

    } catch (error) {
      console.error('Erreur initialisation carte:', error);
    }
  }

  private detectUserLocation() {
    this.isLoadingLocation = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          this.transportInfo.userLocation = { lat: userLat, lng: userLng };
          this.calculateRouteInfo(userLat, userLng);
          this.addUserMarker(userLat, userLng);
          
          this.isLoadingLocation = false;
        },
        (error) => {
          console.log('Localisation non disponible:', error);
          this.transportInfo.directions = 'Activez la localisation pour voir les itinéraires depuis votre position';
          this.isLoadingLocation = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      this.transportInfo.directions = 'La géolocalisation n\'est pas supportée par votre navigateur';
      this.isLoadingLocation = false;
    }
  }

  private calculateRouteInfo(userLat: number, userLng: number) {
    const distance = this.calculateDistance(
      userLat, userLng,
      this.brocanteLocation.lat, this.brocanteLocation.lng
    );
    
    this.transportInfo.distance = `${distance} km`;
    this.transportInfo.duration = this.estimateTravelTime(distance);
    this.transportInfo.directions = this.generateDirections(distance);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  }

  private estimateTravelTime(distance: string): string {
    const dist = parseFloat(distance);
    if (dist < 1) return '5-10 min';
    if (dist < 3) return '10-20 min';
    if (dist < 5) return '20-30 min';
    if (dist < 10) return '30-45 min';
    return '45+ min';
  }

  private generateDirections(distance: string): string {
    const dist = parseFloat(distance);
    
    if (dist < 0.5) {
      return 'À quelques minutes à pied. Profitez de la balade !';
    } else if (dist < 2) {
      return 'Idéal en taxi ou moto-taxi. Plusieurs lignes de transport disponibles.';
    } else if (dist < 5) {
      return 'Recommandé en taxi ou bus. Notre quartier est bien desservi.';
    } else {
      return 'Accessible en taxi ou voiture personnelle. Stationnement disponible.';
    }
  }

  private addUserMarker(lat: number, lng: number) {
    const userIcon = L.divIcon({
      html: '📍',
      className: 'user-marker',
      iconSize: [25, 25],
      iconAnchor: [12, 25]
    });

    L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('Votre position actuelle');

    // Ajuster la vue pour voir les deux marqueurs
    const bounds = L.latLngBounds([
      [lat, lng],
      [this.brocanteLocation.lat, this.brocanteLocation.lng]
    ]);
    this.map.fitBounds(bounds, { padding: [20, 20] });
  }

  getFormattedAddress(): string[] {
    return this.brocanteLocation.address.split(',').map(part => part.trim());
  }

  getGoogleMapsLink(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.brocanteLocation.address)}`;
  }

  getDirectionsLink(): string {
    if (!this.transportInfo.userLocation) return this.getGoogleMapsLink();
    
    return `https://www.google.com/maps/dir/${this.transportInfo.userLocation.lat},${this.transportInfo.userLocation.lng}/${this.brocanteLocation.lat},${this.brocanteLocation.lng}`;
  }
}