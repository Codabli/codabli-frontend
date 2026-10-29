import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language.service';
import type { SubscriptionOffer } from '@models/interfaces/subscription-offer.interface';
import { ButtonComponent } from '@shared/components/button/button.component';

interface Benefit {
  key: string;
  params?: Record<string, string | number>;
}

@Component({
  imports: [TranslatePipe, ButtonComponent],
  selector: 'app-subscription-offer-card',
  styleUrl: './subscription-offer-card.component.scss',
  templateUrl: './subscription-offer-card.component.html',
})
export class SubscriptionOfferCardComponent {
  private readonly languageService = inject(LanguageService);

  readonly offer = input.required<SubscriptionOffer>();

  readonly accent = computed(() => {
    switch (this.offer().publicCible) {
      case 'famille':
        return 'yellow';
      case 'enseignant':
        return 'blue';
      default:
        return 'pink';
    }
  });

  readonly price = computed(() =>
    new Intl.NumberFormat(this.languageService.currentLanguage(), {
      style: 'currency',
      currency: 'EUR',
    }).format(this.offer().tarif),
  );

  readonly benefits = computed<Benefit[]>(() => {
    const offer = this.offer();
    const benefits: Benefit[] = [];

    if (offer.limiteProfils) {
      benefits.push({
        key: `subscriptions.benefits.profiles.${offer.limiteProfils === 1 ? 'one' : 'other'}`,
        params: { count: offer.limiteProfils },
      });
    }
    if (offer.limiteClasses) {
      benefits.push({
        key: `subscriptions.benefits.classes.${offer.limiteClasses === 1 ? 'one' : 'other'}`,
        params: { count: offer.limiteClasses },
      });
    }
    if (offer.stockageMo) {
      benefits.push({
        key: 'subscriptions.benefits.storage',
        params: { size: this.formatStorage(offer.stockageMo) },
      });
    }

    if (offer.accesWebinaires) {
      benefits.push({ key: 'subscriptions.benefits.webinars' });
    }
    if (offer.accesCoaching) {
      benefits.push({ key: 'subscriptions.benefits.coaching' });
    }
    if (offer.accesExports) {
      benefits.push({ key: 'subscriptions.benefits.exports' });
    }

    return benefits;
  });

  private formatStorage(megabytes: number): string {
    const language = this.languageService.currentLanguage();

    return megabytes >= 1000
      ? new Intl.NumberFormat(language, { style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }).format(megabytes / 1000)
      : new Intl.NumberFormat(language, { style: 'unit', unit: 'megabyte' }).format(megabytes);
  }
}
