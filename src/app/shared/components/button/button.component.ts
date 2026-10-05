import { Component, input } from '@angular/core';
import { IconName, IconComponent } from '../icon/icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiary-ico' | 'outline';

export type ButtonType = 'button' | 'submit' | 'reset';

export type IconPosition = 'left' | 'right';

export type ButtonNavigationIcon = 'chevron-left' | 'chevron-right' | 'circle-plus' | 'circle-minus';

@Component({
  imports: [IconComponent],
  selector: 'app-button',
  styleUrl: './button.component.scss',
  templateUrl: './button.component.html',
})
export class Button {
  variant = input<ButtonVariant>('primary');
  type = input<ButtonType>('button');
  disabled = input(false);

  icon = input<IconName | undefined>(undefined);
  iconPosition = input<IconPosition>('left');

  navigationIcon = input<ButtonNavigationIcon | undefined>(undefined);
}
