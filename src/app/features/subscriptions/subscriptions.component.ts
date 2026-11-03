import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionOfferService } from '@core/services/subscription-offer.service';
import { SubscriptionOfferCardComponent } from './components/subscription-offer-card/subscription-offer-card.component';
import type {
  SubscriptionAudience,
  SubscriptionOffer,
} from '@models/interfaces/subscription-offer.interface';

const AUDIENCE_ORDER: SubscriptionAudience[] = ['famille', 'enseignant', 'etablissement', 'structure'];

function sortOffers(offers: SubscriptionOffer[]): SubscriptionOffer[] {
  return [...offers].sort(
    (a, b) =>
      AUDIENCE_ORDER.indexOf(a.publicCible) - AUDIENCE_ORDER.indexOf(b.publicCible) ||
      a.tarif - b.tarif,
  );
}

@Component({
  imports: [RouterLink, TranslatePipe, SubscriptionOfferCardComponent],
  selector: 'app-subscriptions',
  styleUrl: './subscriptions.component.scss',
  templateUrl: './subscriptions.component.html',
})
export class SubscriptionsComponent implements OnInit {
  private readonly subscriptionOfferService = inject(SubscriptionOfferService);

  readonly state = signal<'loading' | 'error' | 'ready'>('loading');

  readonly offers = signal<SubscriptionOffer[]>([]);

  ngOnInit(): void {
    this.subscriptionOfferService.getOffers().subscribe({
      next: (offers) => {
        this.offers.set(sortOffers(offers.filter((offer) => offer.actif)));
        this.state.set('ready');
      },
      error: () => this.state.set('error'),
    });
  }
}
