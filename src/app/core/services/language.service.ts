import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppLanguage } from '../../models/types/app-language.type';
import type { LanguageOption } from '../../models/interfaces/language-option.interface';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);

   readonly languages: readonly LanguageOption[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
  ];

  readonly currentLanguage = signal<AppLanguage>('fr');

  changeLanguage(language: AppLanguage): void {
    this.translate.use(language);
    this.currentLanguage.set(language);
  }
}
