import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LocationComponent } from './pages/location/location.component';
import { LoginComponent } from './pages/admin/login/login.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ProductsManagementComponent } from './pages/admin/products-management/products-management.component';
import { AuthGuard } from './services/auth.guard';
import { CategoriesManagementComponent } from './pages/admin/categories-management/categories-management.component';
import { SettingsComponent } from './pages/admin/settings/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'produits', component: ProductsComponent },
  { path: 'produit/:id', component: ProductDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'localisation', component: LocationComponent },

  // Pages légales
  {
    path: 'mentions-legales',
    loadComponent: () => import('./pages/legal/legal-notice/legal-notice.component').then(m => m.LegalNoticeComponent)
  },
  {
    path: 'confidentialite',
    loadComponent: () => import('./pages/legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'cgu',
    loadComponent: () => import('./pages/legal/terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent)
  },

  // Routes admin PROTÉGÉES
  { path: 'admin/login', component: LoginComponent },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard] // ← Protection
  },
  {
    path: 'admin/products',
    component: ProductsManagementComponent,
    canActivate: [AuthGuard] // ← Protection
  },
  {
    path: 'admin/categories',
    component: CategoriesManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/media',
    loadComponent: () => import('./pages/admin/media-library/media-library.component').then(m => m.MediaLibraryComponent),
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: '' }
];