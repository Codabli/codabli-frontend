import { Component, input } from '@angular/core';

export type IconName = 'arrow-right4' | 'heart' | 'archive';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class Icon {
  name = input.required<IconName>();
  size = input<number>(24);
}
