import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
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
    {
      name: 'Facebook',
      labelKey: 'footer.social.facebook',
      iconUrl: '/assets/icons/socials/facebook.svg',
      url: '#',
    },
    {
      name: 'Instagram',
      labelKey: 'footer.social.instagram',
      iconUrl: '/assets/icons/socials/instagram.svg',
      url: '#',
    },
    {
      name: 'YouTube',
      labelKey: 'footer.social.youtube',
      iconUrl: '/assets/icons/socials/youtube.svg',
      url: '#',
    },
    {
      name: 'LinkedIn',
      labelKey: 'footer.social.linkedin',
      iconUrl: '/assets/icons/socials/linkedin.svg',
      url: '#',
    },
  ];

  readonly legalLinks = [
    { labelKey: 'footer.legal.accessibility', path: '/accessibilite' },
    { labelKey: 'footer.legal.legalNotice', path: '/mentions-legales' },
    { labelKey: 'footer.legal.privacy', path: '/confidentialite' },
  ];

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
