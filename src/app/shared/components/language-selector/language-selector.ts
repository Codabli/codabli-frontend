import { Component, inject } from '@angular/core';
import { Language } from '../../../core/services/language';
import type { AppLanguage } from '../../../models/types/app-language';

@Component({
  imports: [],
  selector: 'app-language-selector',
  styleUrl: './language-selector.scss',
  templateUrl: './language-selector.html',
})
export class LanguageSelector {
  readonly language = inject(Language);

  changeLanguage(language: AppLanguage): void {
    this.language.changeLanguage(language);
  }
}
