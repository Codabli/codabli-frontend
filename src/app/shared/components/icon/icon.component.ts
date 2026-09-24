import { Component, input } from '@angular/core';

export type IconName = 'arrow-right4' | 'heart' | 'archive' | 'search' | 'arrow-down4' | 'profile' | 'shop' | 'menu';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class Icon {
  name = input.required<IconName>();
  size = input<number>(24);

  readonly externalIcons: Partial<Record<IconName, string>> = {
    'shop': '/assets/icons/shop.svg',
    'profile': '/assets/icons/profile.svg',
  };
}
