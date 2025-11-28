import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicLayoutComponent } from '../../../layouts/public-layout.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, PublicLayoutComponent],
  template: `
    <app-public-layout>
      <div class="min-h-screen bg-slate-50 py-12">
        <div class="container mx-auto px-4 max-w-4xl">
          <h1 class="text-3xl font-bold text-slate-900 mb-8">Politique de Confidentialité</h1>
          
          <div class="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">1. Collecte des données</h2>
              <p class="text-slate-600 leading-relaxed">
                Nous collectons uniquement les données que vous nous transmettez volontairement (par exemple via le <strong>formulaire de contact</strong>) pour le bon fonctionnement du service. Cela peut inclure : nom, prénom, email, numéro de téléphone.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">2. Utilisation des données</h2>
              <p class="text-slate-600 leading-relaxed">
                Vos données sont utilisées pour :<br>
                - Répondre à vos demandes de contact<br>
                - Gérer vos commandes (le cas échéant)<br>
                - Améliorer notre service
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">3. Vos droits</h2>
              <p class="text-slate-600 leading-relaxed">
                Vous disposez d'un droit d'accès, de modification et de suppression de vos données personnelles. Pour l'exercer, contactez-nous via le formulaire de contact ou par email.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">4. Cookies</h2>
              <p class="text-slate-600 leading-relaxed">
                Ce site peut utiliser des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visites anonymes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </app-public-layout>
  `
})
export class PrivacyPolicyComponent { }
