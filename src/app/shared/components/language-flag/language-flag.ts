import { Component, computed, input } from '@angular/core'

@Component({
  imports: [],
  selector: 'app-language-flag',
  styleUrl: './language-flag.scss',
  templateUrl: './language-flag.html',
})
export class LanguageFlag {
  language = input.required<LanguageCode>();

  countryCode = computed(() => {
    const countries: Record<LanguageCode, string> = {
      fr: 'fr',
      es: 'es',
      en: 'gb',
      de: 'de',
      it: 'it',
    };

    return countries[this.language()];
  });

  label = computed(() => {
    const labels: Record<LanguageCode, string> = {
      en: 'English',
      fr: 'Français',
      es: 'Español',
      de: 'Deutsch',
      it: 'Italiano',
    };
    return labels[this.language()];
  })
}import { LanguageCode } from '../../../models/types/language-code';

