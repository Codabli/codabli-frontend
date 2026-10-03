import { Component } from '@angular/core';

@Component({
  selector: 'app-subscription-cards',
  styleUrl: './subscription-cards.component.scss',
  templateUrl: './subscription-cards.component.html',
})
export class SubscriptionCardsComponent {
  protected readonly plans = [
    {
      name: 'Pour les curieux',
      description: 'Faites vos premiers pas dans l’univers des contes dansés.',
      icon: 'fa-solid fa-seedling',
      color: 'yellow',
    },
    {
      name: 'Pour les familles',
      description: 'Partagez des histoires et des moments créatifs ensemble.',
      icon: 'fa-solid fa-house-heart',
      color: 'pink',
    },
    {
      name: 'Pour les professionnels',
      description:
        'Découvrez des ressources pensées pour vos projets éducatifs.',
      icon: 'fa-solid fa-chalkboard-user',
      color: 'blue',
    },
  ];
}
