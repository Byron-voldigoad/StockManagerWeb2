import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicLayoutComponent } from '../../../layouts/public-layout.component';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule, PublicLayoutComponent],
  template: `
    <app-public-layout>
      <div class="min-h-screen bg-slate-50 py-12">
        <div class="container mx-auto px-4 max-w-4xl">
          <h1 class="text-3xl font-bold text-slate-900 mb-8">Conditions Générales d'Utilisation (CGU)</h1>
          
          <div class="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">1. Objet</h2>
              <p class="text-slate-600 leading-relaxed">
                Les présentes conditions générales ont pour objet de définir les modalités de mise à disposition des services du site et les conditions d'utilisation du service par l'utilisateur.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">2. Accès au service</h2>
              <p class="text-slate-600 leading-relaxed">
                Le site est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Tous les coûts afférents à l'accès au service, que ce soient les frais matériels, logiciels ou d'accès à internet sont exclusivement à la charge de l'utilisateur.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">3. Propriété intellectuelle</h2>
              <p class="text-slate-600 leading-relaxed">
                Les marques, logos, signes ainsi que tout le contenu du site (textes, images, son...) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-slate-800 mb-4">4. Responsabilité</h2>
              <p class="text-slate-600 leading-relaxed">
                Les informations communiquées sur le site sont présentées à titre indicatif et général sans valeur contractuelle. Malgré des mises à jour régulières, le site ne peut être tenu responsable de la modification des dispositions administratives et juridiques survenant après la publication.
              </p>
            </section>
          </div>
        </div>
      </div>
    </app-public-layout>
  `
})
export class TermsConditionsComponent { }
