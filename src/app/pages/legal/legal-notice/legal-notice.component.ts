import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicLayoutComponent } from '../../../layouts/public-layout.component';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [CommonModule, PublicLayoutComponent],
  template: `
    <app-public-layout>
      <div class="min-h-screen bg-slate-50 py-12">
        <div class="container mx-auto px-4 max-w-4xl">
          <h1 class="text-3xl font-bold text-slate-900 mb-8">Mentions Légales</h1>
          
          <div class="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">1. Éditeur du site</h2>
              <p class="text-slate-600 leading-relaxed">
                Ce site est édité par <strong>Annie Brocante</strong>.<br>
                Siège social : [Adresse de la brocante]<br>
                SIRET : [Votre Numéro SIRET]<br>
                Email : [Votre email]<br>
                Téléphone : [Votre numéro]
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">2. Hébergement</h2>
              <p class="text-slate-600 leading-relaxed">
                Ce site est hébergé par :<br>
                <strong>Vercel Inc.</strong><br>
                Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br>
                Site web : https://vercel.com
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">3. Propriété intellectuelle</h2>
              <p class="text-slate-600 leading-relaxed">
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
            </section>
          </div>
        </div>
      </div>
    </app-public-layout>
  `
})
export class LegalNoticeComponent { }
