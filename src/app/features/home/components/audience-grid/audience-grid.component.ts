import { Component } from '@angular/core';

@Component({
  selector: 'app-audience-grid',
  styleUrl: './audience-grid.component.scss',
  templateUrl: './audience-grid.component.html',
})
export class AudienceGridComponent {
  protected readonly audiences = [
    {
      image: '/assets/images/audience/enfants.png',
      title: 'Les enfants',
      description:
        'Lire, bouger, imaginer : les enfants deviennent les héros de leurs histoires.',
      action: 'Découvrir nos solutions pour vous',
    },
    {
      image: '/assets/images/audience/professionnels_de_l_education.png',
      title: 'Les professionnels de l’éducation',
      description:
        'Des ressources créatives pour faire vivre les histoires et accompagner les apprentissages.',
      action: 'Découvrir nos solutions pour vous',
    },
    {
      image: '/assets/images/audience/parents.png',
      title: 'Les parents',
      description:
        'Un moment complice pour lire, danser et créer de beaux souvenirs ensemble.',
      action: 'Découvrir nos solutions pour vous',
    },
  ];
}
