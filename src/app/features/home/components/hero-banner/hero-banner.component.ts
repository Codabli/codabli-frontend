import { ChangeDetectionStrategy, Component } from '@angular/core';

type HeroActionColor = 'pink' | 'blue' | 'yellow' | 'turquoise';

interface HeroAction {
  label: string;
  color: HeroActionColor;
}

@Component({
  selector: 'app-hero-banner',
  styleUrl: './hero-banner.component.scss',
  templateUrl: './hero-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  readonly actions: HeroAction[] = [
    { label: 'Découvrez nos contes dansés', color: 'yellow' },
    { label: 'Créez vos propres contes dansés', color: 'turquoise' },
    { label: 'Explorez notre univers', color: 'pink' },
    { label: 'Visitez notre boutique', color: 'blue' },
  ];
}
