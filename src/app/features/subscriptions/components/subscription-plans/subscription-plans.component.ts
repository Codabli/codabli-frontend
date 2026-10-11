import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type SubscriptionPlan = {
  nameKey: string;
  price: number;
  descriptionKey: string;
  benefits: string[];
  accent: 'yellow' | 'pink' | 'blue';
};

@Component({
  imports: [TranslatePipe],
  selector: 'app-subscription-plans',
  styleUrl: './subscription-plans.component.scss',
  templateUrl: './subscription-plans.component.html',
})
export class SubscriptionPlansComponent {
  protected readonly plans: SubscriptionPlan[] = [
    {
      nameKey: 'home.subscriptions.plans.first.name',
      price: 2,
      descriptionKey: 'home.subscriptions.plans.first.description',
      benefits: [
        'home.subscriptions.plans.benefits.selectedTales',
        'home.subscriptions.plans.benefits.newStories',
        'home.subscriptions.plans.benefits.activities',
        'home.subscriptions.plans.benefits.familySpace',
        'home.subscriptions.plans.benefits.noCommitment',
      ],
      accent: 'yellow',
    },
    {
      nameKey: 'home.subscriptions.plans.second.name',
      price: 2,
      descriptionKey: 'home.subscriptions.plans.second.description',
      benefits: [
        'home.subscriptions.plans.benefits.allTales',
        'home.subscriptions.plans.benefits.newStories',
        'home.subscriptions.plans.benefits.activities',
        'home.subscriptions.plans.benefits.familySpace',
        'home.subscriptions.plans.benefits.noCommitment',
      ],
      accent: 'pink',
    },
    {
      nameKey: 'home.subscriptions.plans.third.name',
      price: 2,
      descriptionKey: 'home.subscriptions.plans.third.description',
      benefits: [
        'home.subscriptions.plans.benefits.allTales',
        'home.subscriptions.plans.benefits.exclusiveContent',
        'home.subscriptions.plans.benefits.activities',
        'home.subscriptions.plans.benefits.familySpace',
        'home.subscriptions.plans.benefits.noCommitment',
      ],
      accent: 'blue',
    },
  ];
}
