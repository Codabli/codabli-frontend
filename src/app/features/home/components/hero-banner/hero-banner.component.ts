import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type HeroActionColor = 'pink' | 'blue' | 'yellow' | 'turquoise';

interface HeroAction {
  labelKey: string;
  color: HeroActionColor;
}

@Component({
  imports: [TranslatePipe],
  selector: 'app-hero-banner',
  styleUrl: './hero-banner.component.scss',
  templateUrl: './hero-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  readonly actions: HeroAction[] = [
    { labelKey: 'home.hero.discoverTales', color: 'yellow' },
    { labelKey: 'home.hero.createTales', color: 'turquoise' },
    { labelKey: 'home.hero.explore', color: 'pink' },
    { labelKey: 'home.hero.shop', color: 'blue' },
  ];
}
