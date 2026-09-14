import { Component, input } from '@angular/core';
import { IconName, Icon } from '../icon/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiary-ico' | 'outline';

export type IconPosition = 'left' | 'right';

export type ButtonNavigationIcon = 'chevron-left' | 'chevron-right' | 'circle-plus';

@Component({
  imports: [Icon],
  selector: 'app-button',
  styleUrl: './button.scss',
  templateUrl: './button.html',
})
export class Button {
  variant = input<ButtonVariant>('primary');
  disabled = input(false);

  icon = input<IconName | undefined>(undefined);
  iconPosition = input<IconPosition>('left');

  navigationIcon = input<ButtonNavigationIcon | undefined>(undefined);
}
