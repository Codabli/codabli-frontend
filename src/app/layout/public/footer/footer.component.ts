import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly assoInfo = {
    name: 'Association Annaba Créative',
    address: '5 allée André Le Nôtre',
    city: '37200 Tours - France',
    phone: '03 83 85 85 85',
  };

  readonly socialLinks = [
    { name: 'Facebook', iconUrl: 'assets/icons/facebook.svg', url: '#' },
    { name: 'Instagram', iconUrl: 'assets/icons/instagram.svg', url: '#' },
    { name: 'YouTube', iconUrl: 'assets/icons/youtube.svg', url: '#' },
    { name: 'LinkedIn', iconUrl: 'assets/icons/linkedin.svg', url: '#' },
  ];

  readonly legalLinks = [
    { label: 'Accessibilité', path: '/accessibilite' },
    { label: 'Mentions légales', path: '/mentions-legales' },
    { label: 'Politique de confidentialité', path: '/confidentialite' },
  ];

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
