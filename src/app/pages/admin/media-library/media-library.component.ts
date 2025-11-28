import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { AdminLayoutComponent } from '../../../layouts/admin-layout.component';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout icon="media">
      <div class="p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Médiathèque</h2>
            <p class="text-slate-600">Gérez les images stockées sur le serveur</p>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Bucket Selector -->
            <select 
              [(ngModel)]="currentBucket" 
              (change)="loadFiles()"
              class="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="product-images">Images Produits</option>
              <option value="site-images">Images du Site</option>
            </select>

            <button 
              (click)="loadFiles()" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ error }}
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && files.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p class="text-slate-500 text-lg">Aucune image trouvée dans {{ currentBucket }}</p>
        </div>

        <!-- Grid -->
        <div *ngIf="!loading && !error && files.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div *ngFor="let file of files" class="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <!-- Image Preview -->
            <div class="aspect-square bg-slate-100 relative overflow-hidden">
              <img 
                [src]="file.publicUrl" 
                [alt]="file.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onerror="this.src='assets/placeholder.png'; this.onerror=null;"
              >
              <!-- Overlay Actions -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a 
                  [href]="file.publicUrl" 
                  target="_blank"
                  class="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                  title="Voir l'image"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </a>
                <button 
                  (click)="confirmDelete(file)"
                  class="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
                  title="Supprimer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- File Info -->
            <div class="p-3">
              <p class="text-sm font-medium text-slate-700 truncate" [title]="file.name">{{ file.name }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ formatSize(file.metadata?.size) }} • {{ file.created_at | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div *ngIf="fileToDelete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-slate-900 mb-2">Confirmer la suppression</h3>
            <p class="text-sm text-slate-500 mb-6">
              Êtes-vous sûr de vouloir supprimer l'image <span class="font-bold text-slate-700">{{ fileToDelete.name }}</span> ?
              <br>
              <span class="text-red-500 font-medium">Cette action est irréversible.</span>
            </p>
          </div>
          <div class="flex gap-3">
            <button 
              (click)="cancelDelete()"
              class="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button 
              (click)="deleteFile()"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `
})
export class MediaLibraryComponent implements OnInit {
  private supabase = inject(SupabaseService);

  files: any[] = [];
  loading = true;
  error: string | null = null;
  fileToDelete: any = null;
  currentBucket: string = 'product-images';

  ngOnInit() {
    this.loadFiles();
  }

  async loadFiles() {
    this.loading = true;
    this.error = null;
    try {
      this.files = await this.supabase.listBucketFiles(this.currentBucket);

      if (this.files.length === 0) {
        console.log(`Aucun fichier trouvé dans le bucket ${this.currentBucket}`);
      }
    } catch (e: any) {
      console.error('Erreur chargement fichiers:', e);
      this.error = "Erreur lors du chargement des images. Vérifiez que le bucket existe.";
    } finally {
      this.loading = false;
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  confirmDelete(file: any) {
    this.fileToDelete = file;
  }

  cancelDelete() {
    this.fileToDelete = null;
  }

  async deleteFile() {
    if (!this.fileToDelete) return;

    const success = await this.supabase.deleteBucketFile(this.fileToDelete.name, this.currentBucket);

    if (success) {
      this.files = this.files.filter(f => f.name !== this.fileToDelete.name);
      this.fileToDelete = null;
    } else {
      alert("Erreur: Impossible de supprimer le fichier. Vérifiez vos permissions (êtes-vous connecté ?) ou si le fichier existe encore.");
      this.fileToDelete = null; // Close modal anyway
    }
  }
}
