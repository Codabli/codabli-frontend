import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SubscriptionAudience,
  SubscriptionOffer,
} from '../../models/interfaces/subscription-offer.interface';

@Injectable({ providedIn: 'root' })
export class SubscriptionOfferService {
  private readonly http = inject(HttpClient);

  getOffers(audience: SubscriptionAudience): Observable<SubscriptionOffer[]> {
    return this.http.get<SubscriptionOffer[]>('/api/abonnements/offres', {
      params: { publicCible: audience },
    });
  }
}
