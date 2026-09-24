import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import type { AppLanguage } from '../../../models/types/app-language.type';

@Component({
  imports: [],
  selector: 'app-language-selector',
  styleUrl: './language-selector.component.scss',
  templateUrl: './language-selector.component.html',
})
export class LanguageSelector {
  readonly languageService = inject(LanguageService);

  changeLanguage(language: AppLanguage): void {
    this.languageService.changeLanguage(language);
  }
}
