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
    component: SettingsComponent, // ← CHANGEMENT ICI
    canActivate: [AuthGuard] // ← AJOUT DE LA PROTECTION
  },
  
  { path: '**', redirectTo: '' }
];