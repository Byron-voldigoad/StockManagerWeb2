import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/supabase.service'; // ← Utilise la même interface

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product; // ← Bien déclaré comme @Input()

  constructor(private router: Router) {}

  navigateToDetail() {
    this.router.navigate(['/produit', this.product.id]);
  }
}