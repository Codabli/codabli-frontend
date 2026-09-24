import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from '../../../shared/components/button/button.component';

interface NavItem {
  label: string;
  route: string;
}

@Component({
  imports: [RouterLink, RouterLinkActive, Button],
  selector: 'app-navbar',
  styleUrl: './navbar.component.scss',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly navItems: NavItem[] = [
    { label: 'Bibliothèque - Contes dansés', route: '/danced-tales' },
    { label: 'Jeu Lecture Créative', route: '/interactive-game' },
    { label: 'Cartes à contes dansés', route: '/story-cards' },
    { label: 'Créer mon conte dansé', route: '/create-danced-tale' },
    { label: "Galerie d'art", route: '/art-gallery' },
    { label: 'Boutique', route: '/shop' },
    { label: 'Partenaires', route: '/partners' },
  ];
}
