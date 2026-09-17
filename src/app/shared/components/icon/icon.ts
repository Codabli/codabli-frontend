import { Component, input } from '@angular/core';

export type IconName = 'arrow-right4';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  name = input.required<IconName>();
  size = input(24);
}
