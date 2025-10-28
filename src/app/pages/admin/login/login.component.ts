import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';

@Component({  // ← CE DÉCORATEUR DOIT ÊTRE PRÉSENT
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // ← IMPORTS CORRECTS
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  error = '';

  constructor(
    private authService: SupabaseAuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const { error, user } = await this.authService.signIn(this.email, this.password);
      
      if (error) {
        this.error = this.getErrorMessage(error.message);
      } else if (user) {
        this.router.navigate(['/admin/dashboard']);
      }
    } catch (error) {
      this.error = 'Erreur de connexion inattendue';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case 'Invalid login credentials':
        return 'Email ou mot de passe incorrect';
      case 'Email not confirmed':
        return 'Veuillez confirmer votre email';
      default:
        return error;
    }
  }
}