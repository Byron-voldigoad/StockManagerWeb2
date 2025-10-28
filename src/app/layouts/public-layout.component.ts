import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../components/navigation/navigation.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css'],
})
export class PublicLayoutComponent {
  // Layout pour le site public AVEC navigation
}
