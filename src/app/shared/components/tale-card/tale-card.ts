import { Component, Input, input } from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import type { Tale } from '../../../models/interfaces/tale';
import { LanguageFlag } from '../language-flag/language-flag';

@Component({
  imports: [Button, Icon, LanguageFlag],
  selector: 'app-tale-card',
  styleUrl: './tale-card.scss',
  templateUrl: './tale-card.html',
})
export class TaleCard {
  @Input() title: string = '';
  @Input() description: string = '';

  tale = input.required<Tale>();


}
