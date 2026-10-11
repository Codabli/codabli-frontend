import { Component } from '@angular/core';

type SubscriptionPlan = {
  name: string;
  price: number;
  description: string;
  benefits: string[];
  accent: 'yellow' | 'pink' | 'blue';
};

@Component({
  selector: 'app-subscription-plans',
  styleUrl: './subscription-plans.component.scss',
  templateUrl: './subscription-plans.component.html',
})
export class SubscriptionPlansComponent {
  protected readonly plans: SubscriptionPlan[] = [
    {
      name: 'Formule Famille 1',
      price: 2,
      description:
        'Une première formule pour découvrir les contes dansés en famille.',
      benefits: [
        'Accès à une sélection de contes',
        'De nouvelles histoires régulièrement',
        'Des activités à partager',
        'Un espace adapté aux familles',
        'Sans engagement',
      ],
      accent: 'yellow',
    },
    {
      name: 'Formule Famille 2',
      price: 2,
      description:
        'Encore plus d’histoires et d’idées pour faire vivre l’imagination.',
      benefits: [
        'Accès à tous les contes',
        'De nouvelles histoires régulièrement',
        'Des activités à partager',
        'Un espace adapté aux familles',
        'Sans engagement',
      ],
      accent: 'pink',
    },
    {
      name: 'Formule Famille 3',
      price: 2,
      description:
        'Toute la créativité de Codabli pour accompagner petits et grands.',
      benefits: [
        'Accès à tous les contes',
        'Des contenus exclusifs',
        'Des activités à partager',
        'Un espace adapté aux familles',
        'Sans engagement',
      ],
      accent: 'blue',
    },
  ];
}
