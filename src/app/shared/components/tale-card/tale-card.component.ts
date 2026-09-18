import { Component, Input, input } from '@angular/core';
import { Button } from '../button/button.component';
import { Icon } from '../icon/icon.component';
import type { Tale } from '../../../models/interfaces/tale.interface';
import { LanguageFlag } from '../language-flag/language-flag.component';

@Component({
  imports: [Button, Icon, LanguageFlag],
  selector: 'app-tale-card',
  styleUrl: './tale-card.component.scss',
  templateUrl: './tale-card.component.html',
})
export class TaleCard {
  @Input() title: string = '';
  @Input() description: string = '';

  tale = input.required<Tale>();


}
