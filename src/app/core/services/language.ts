import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppLanguage } from '../../models/types/app-language';

@Injectable({
  providedIn: 'root',
})
export class Language {
  private readonly translate = inject(TranslateService);

  readonly currentLanguage = signal<AppLanguage>('fr');

  changeLanguage(language: AppLanguage): void {
    this.translate.use(language);
    this.currentLanguage.set(language);
  }
}
