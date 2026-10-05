import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Tale } from '../../models/interfaces/tale.interface';
import { Button } from '../../shared/components/button/button.component';
import { TaleCardComponent } from '../../shared/components/tale-card/tale-card.component';
import { LibraryCarouselComponent } from './components/library-carousel/library-carousel.component';
import { LibraryFiltersComponent } from './components/library-filters/library-filters.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  imports: [TranslatePipe, TaleCardComponent, LibraryFiltersComponent, Button, LibraryCarouselComponent, IconComponent],
  selector: 'app-library',
  styleUrl: './library.component.scss',
  templateUrl: './library.component.html',
})
export class LibraryComponent {
  protected readonly showAllResults = signal(false);

  protected showMoreResults(): void {
    if (this.showAllResults()) {
      this.showAllResults.set(false);
    } else {
      this.showAllResults.set(true);
    }
  }

  protected toggleResultsView(): void {
    this.showAllResults.set(!this.showAllResults());
  }

  tales(): Tale[] {
    return [
      {
        id: 1,
        title: 'Tale 1',
        description: 'Description 1',
        coverUrl: 'assets/images/tales-test.png',
        likes: 10,
        isFavorite: true,
        languages: ['en'],
        themes: ['adventure'],
      },

      {
        id: 2,
        title: 'Tale 2',
        description: 'Description 2',
        coverUrl: 'assets/images/tales-test.png',
        likes: 5,
        isFavorite: false,
        languages: ['fr'],
        themes: ['fantasy'],
      },
      {
        id: 3,
        title: 'Tale 3',
        description: 'Description 3',
        coverUrl: 'assets/images/tales-test.png',
        likes: 8,
        isFavorite: true,
        languages: ['es'],
        themes: ['mystery'],
      },
      {
        id: 4,
        title: 'Tale 4',
        description: 'Description 4',
        coverUrl: 'assets/images/tales-test.png',
        likes: 12,
        isFavorite: false,
        languages: ['de'],
        themes: ['horror'],
      },
      {
        id: 5,
        title: 'Tale 5',
        description: 'Description 5',
        coverUrl: 'assets/images/tales-test.png',
        likes: 7,
        isFavorite: true,
        languages: ['it'],
        themes: ['romance'],
      },
      {
        id: 6,
        title: 'Tale 6',
        description: 'Description 6',
        coverUrl: 'assets/images/tales-test.png',
        likes: 9,
        isFavorite: false,
        languages: ['fr'],
        themes: ['historical'],
      },
    ];
  }
}
