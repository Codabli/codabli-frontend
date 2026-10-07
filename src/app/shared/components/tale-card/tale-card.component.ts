import { Component, Input, input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import type { Tale } from '@models/interfaces/tale.interface';
import { LanguageFlag } from '@shared/components/language-flag/language-flag.component';

@Component({
  imports: [ButtonComponent, IconComponent, LanguageFlag],
  selector: 'app-tale-card',
  styleUrl: './tale-card.component.scss',
  templateUrl: './tale-card.component.html',
})
export class TaleCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';

  tale = input.required<Tale>();
}
