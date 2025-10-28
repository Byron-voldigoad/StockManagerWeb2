import { Injectable } from '@angular/core';
import { SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { SupabaseClientService } from './supabase-client';

@Injectable({
  providedIn: 'root'
})
export class SupabaseAuthService {
  private supabase: SupabaseClient;
  private _currentUser: User | null = null;

constructor(private router: Router) {
  this.supabase = SupabaseClientService.getInstance(); // ← Même instance
}

  // Charger l'utilisateur actuel
  private async loadUser() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this._currentUser = session?.user ?? null;
  }

  // Connexion avec email/mot de passe
  async signIn(email: string, password: string): Promise<{ error: AuthError | null; user: User | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data?.user) {
      this._currentUser = data.user;
    }
    
    return { error, user: data?.user ?? null };
  }

  // Déconnexion
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this._currentUser = null;
    this.router.navigate(['/admin/login']);
  }

  // Vérifier si connecté (synchrone)
  isAuthenticated(): boolean {
    return this._currentUser !== null;
  }

  // Obtenir l'utilisateur actuel (synchrone)
  getCurrentUser(): User | null {
    return this._currentUser;
  }

  // Écouter les changements d'authentification
  getAuthState() {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      this._currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/admin/login']);
      }
    });
  }
}