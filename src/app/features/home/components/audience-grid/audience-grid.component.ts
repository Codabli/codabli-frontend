import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-audience-grid',
  styleUrl: './audience-grid.component.scss',
  templateUrl: './audience-grid.component.html',
})
export class AudienceGridComponent {
  protected readonly audiences = [
    {
      image: '/assets/images/audience/enfants.png',
      titleKey: 'home.audience.children.title',
      descriptionKey: 'home.audience.children.description',
    },
    {
      image: '/assets/images/audience/professionnels_de_l_education.png',
      titleKey: 'home.audience.educators.title',
      descriptionKey: 'home.audience.educators.description',
    },
    {
      image: '/assets/images/audience/parents.png',
      titleKey: 'home.audience.parents.title',
      descriptionKey: 'home.audience.parents.description',
    },
  ];
}
