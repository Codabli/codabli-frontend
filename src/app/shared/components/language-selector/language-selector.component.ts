import { Component, inject } from '@angular/core';
import { Language } from '../../../core/services/language.service';
import type { AppLanguage } from '../../../models/types/app-language.type';

@Component({
  imports: [],
  selector: 'app-language-selector',
  styleUrl: './language-selector.component.scss',
  templateUrl: './language-selector.component.html',
})
export class LanguageSelector {
  readonly language = inject(Language);

  changeLanguage(language: AppLanguage): void {
    this.language.changeLanguage(language);
  }
}
