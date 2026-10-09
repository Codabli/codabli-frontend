import { Component, Input, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import type { Tale } from '@models/interfaces/tale.interface';
import { LanguageFlag } from '@shared/components/language-flag/language-flag.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [ButtonComponent, IconComponent, LanguageFlag, TranslatePipe],
  selector: 'app-tale-card',
  styleUrl: './tale-card.component.scss',
  templateUrl: './tale-card.component.html',
})
export class TaleCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';

  tale = input.required<Tale>();

  readonly locked = input(false);

  readonly consult = output<void>();
  readonly adopt = output<void>();
  readonly login = output<void>();
}
