import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { PublicLayoutComponent } from '../../layouts/public-layout.component';
import { SiteConfigService } from '../../services/site-config.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavigationComponent,
    PublicLayoutComponent
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  configService = inject(SiteConfigService);
  private fb = inject(FormBuilder);

  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { name, email, message } = this.contactForm.value;

    // Option 1: Ouvrir le client email avec les données pré-remplies
    const contactEmail = this.configService.getSetting('contact_email') || 'byronvoldigoad@gmail.com';
    const subject = `Message de ${name} via le site`;
    const body = `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Ouvrir le client email
    window.location.href = mailtoLink;

    // Réinitialiser le formulaire après un court délai
    setTimeout(() => {
      this.contactForm.reset();
      this.isSubmitting = false;
      this.submitSuccess = true;

      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 500);
  }

  // Alternative: Envoyer via WhatsApp
  sendViaWhatsApp() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { name, email, message } = this.contactForm.value;
    const whatsappNumber = this.configService.getSetting('whatsapp_number') || '237696149067';
    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    const whatsappMessage = `Bonjour,\n\nJe suis ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappUrl, '_blank');

    // Réinitialiser le formulaire
    this.contactForm.reset();
  }

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