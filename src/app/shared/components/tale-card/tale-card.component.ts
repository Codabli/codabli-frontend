import { Component, Input, input } from '@angular/core';
import { Button } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import type { Tale } from '../../../models/interfaces/tale.interface';
import { LanguageFlag } from '../language-flag/language-flag.component';

@Component({
  imports: [Button, IconComponent, LanguageFlag],
  selector: 'app-tale-card',
  styleUrl: './tale-card.component.scss',
  templateUrl: './tale-card.component.html',
})
export class TaleCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';

  tale = input.required<Tale>();


}
