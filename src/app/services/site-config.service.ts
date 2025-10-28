import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';
import { BehaviorSubject } from 'rxjs';

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  type: 'text' | 'html' | 'image' | 'json';
  category: string;
  description: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteConfigService {
  private supabase: SupabaseClient = SupabaseClientService.getInstance();
  
  private settings = new BehaviorSubject<Map<string, any>>(new Map());
  public settings$ = this.settings.asObservable();

  constructor() {
    this.loadSettings();
  }

  async loadSettings(): Promise<void> {
  try {
    const { data, error } = await this.supabase
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('Erreur chargement settings:', error);
      // Fallback: utiliser les valeurs par défaut
      this.setDefaultSettings();
      return;
    }

    console.log('Settings chargés:', data);

    const settingsMap = new Map();
    data?.forEach(setting => {
      settingsMap.set(setting.key, this.parseValue(setting));
    });
    
    this.settings.next(settingsMap);
  } catch (err) {
    console.error('Erreur dans loadSettings:', err);
    // Fallback en cas d'erreur critique
    this.setDefaultSettings();
  }
}

// Méthode de fallback
private setDefaultSettings(): void {
  const defaultSettings = new Map();
  defaultSettings.set('contact_title', 'Contactez-nous');
  defaultSettings.set('contact_subtitle', 'Une question ? Écrivez-nous !');
  defaultSettings.set('contact_form_title', 'Envoyez-nous un message');
  defaultSettings.set('name_label', 'Nom');
  defaultSettings.set('name_placeholder', 'Votre nom');
  defaultSettings.set('email_label', 'Email');
  defaultSettings.set('email_placeholder', 'votre@email.com');
  defaultSettings.set('message_label', 'Message');
  defaultSettings.set('message_placeholder', 'Votre message...');
  defaultSettings.set('send_message', 'Envoyer le message');
  defaultSettings.set('contact_email', 'contact@labrocante.fr');
  defaultSettings.set('contact_phone', '+33 1 23 45 67 89');
  defaultSettings.set('contact_address', '123 Rue des Antiquités, 75001 Paris');
  defaultSettings.set('opening_hours_title', 'Horaires d\'ouverture');
  defaultSettings.set('address_title', 'Notre adresse');
  
  this.settings.next(defaultSettings);
}

  private parseValue(setting: any): any {
    switch (setting.type) {
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch {
          return setting.value;
        }
      default:
        return setting.value;
    }
  }

  getSetting(key: string): any {
    return this.settings.value.get(key);
  }

  async updateSetting(key: string, value: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('site_settings')
      .update({ 
        value, 
        updated_at: new Date().toISOString() 
      })
      .eq('key', key);

    if (error) {
      console.error('Erreur mise à jour setting:', error);
      return false;
    }

    await this.loadSettings();
    return true;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('*')
        .order('category');

      if (error) {
        console.error('Erreur récupération settings:', error);
        return [];
      }

      console.log('Tous les settings:', data);
      return data || [];
    } catch (err) {
      console.error('Erreur dans getAllSettings:', err);
      return [];
    }
  }
async uploadImage(file: File, bucket: string = 'site-images'): Promise<string | null> {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload image:', error);
        return null;
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;

    } catch (error) {
      console.error('Erreur upload:', error);
      return null;
    }
  }

  // NOUVELLE MÉTHODE : Mettre à jour un setting avec upload optionnel
  // ... code existant ...

  // CORRECTION: Typage correct pour le paramètre optionnel
  async updateSettingWithImage(key: string, value: string, imageFile?: File): Promise<boolean> {
    let finalValue = value;

    // Si un fichier image est fourni, l'uploader d'abord
    if (imageFile) {
      const imageUrl = await this.uploadImage(imageFile);
      if (imageUrl) {
        finalValue = imageUrl;
      } else {
        return false; // Échec upload
      }
    }

    // Mettre à jour le setting
    return await this.updateSetting(key, finalValue);
  }

// ... code existant ...
}