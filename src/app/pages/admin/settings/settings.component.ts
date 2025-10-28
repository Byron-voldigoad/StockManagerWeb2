import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteConfigService, SiteSetting } from '../../../services/site-config.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  private configService = inject(SiteConfigService);
  
  settings: SiteSetting[] = [];
  categories: string[] = [];
  selectedCategory = 'hero';
  unsavedChanges: { [key: string]: string } = {};
  imageFiles: { [key: string]: File | null } = {};
  isLoading = true;

  get unsavedChangesCount(): number {
    return Object.keys(this.unsavedChanges).length + Object.keys(this.imageFiles).filter(key => this.imageFiles[key] !== null).length;
  }

  get hasUnsavedChanges(): boolean {
    return this.unsavedChangesCount > 0;
  }

  get noUnsavedChanges(): boolean {
    return this.unsavedChangesCount === 0;
  }

  async ngOnInit() {
    await this.loadSettings();
    this.isLoading = false;
  }

  async loadSettings() {
    this.settings = await this.configService.getAllSettings();
    this.categories = [...new Set(this.settings.map(s => s.category))];
  }

  getSettingsByCategory() {
    return this.settings.filter(s => s.category === this.selectedCategory);
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'hero': '🏠 Page Accueil',
      'header': '🔗 Navigation',
      'products': '📦 Page Produits',
      'contact': '📞 Page Contact',
      'contact_info': 'ℹ️ Infos Contact',
      'buttons': '🔘 Boutons',
      'seo': '🔍 SEO',
      'location': '📍 Localisation'
    };
    return labels[category] || category;
  }

  onSettingChange(key: string, event: any) {
    this.unsavedChanges[key] = event.target.value;
  }

  onImageChange(key: string, event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop volumineuse (max 5MB)');
        return;
      }

      this.imageFiles[key] = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const preview = document.getElementById(`preview-${key}`) as HTMLImageElement;
        if (preview) {
          preview.src = e.target.result;
          preview.classList.remove('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  hasUnsavedChangesForKey(key: string): boolean {
    return !!this.unsavedChanges[key] || !!this.imageFiles[key];
  }

  formatJson(value: any): string {
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }

  // CORRECTION: Gestion correcte du typage File | null
  async saveChanges() {
    for (const [key, value] of Object.entries(this.unsavedChanges)) {
      const imageFile = this.imageFiles[key];
      let success: boolean;
      
      if (imageFile) {
        // Si un fichier image est sélectionné
        success = await this.configService.updateSettingWithImage(key, value, imageFile);
      } else {
        // Si seulement du texte est modifié
        success = await this.configService.updateSetting(key, value);
      }
      
      if (success) {
        delete this.unsavedChanges[key];
        delete this.imageFiles[key];
      }
    }
    
    // Sauvegarder les images qui n'ont pas de changement de texte
    for (const [key, imageFile] of Object.entries(this.imageFiles)) {
      if (imageFile && !this.unsavedChanges[key]) {
        const success = await this.configService.updateSettingWithImage(key, '', imageFile);
        if (success) {
          delete this.imageFiles[key];
        }
      }
    }
    
    await this.loadSettings();
  }

  cancelChanges() {
    this.unsavedChanges = {};
    this.imageFiles = {};
    
    document.querySelectorAll('[id^="preview-"]').forEach((el: any) => {
      el.classList.add('hidden');
    });
  }
}