import { Component, signal, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TaleFilters } from '@models/interfaces/tale-filters.interface';
import { Tale } from '@models/interfaces/tale.interface';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TaleCardComponent } from '@shared/components/tale-card/tale-card.component';
import { LibraryCarouselComponent } from './components/library-carousel/library-carousel.component';
import { LibraryFiltersComponent } from './components/library-filters/library-filters.component';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  imports: [
    TranslatePipe,
    TaleCardComponent,
    LibraryFiltersComponent,
    ButtonComponent,
    LibraryCarouselComponent,
    IconComponent,
  ],
  selector: 'app-library',
  styleUrl: './library.component.scss',
  templateUrl: './library.component.html',
})
export class LibraryComponent {
  protected readonly isGridView = signal(true);

  private readonly resultsStep = 8;

  protected readonly visibleResultsCount = signal(this.resultsStep);

  protected readonly filters = signal<TaleFilters>({
    search: '',
    languages: [],
    themes: [],
  });

  protected onFiltersChange(filters: TaleFilters): void {
    this.filters.set(filters);
    this.visibleResultsCount.set(this.resultsStep);
  }

  protected readonly filteredTales = computed(() => {
    const search = this.filters().search.toLowerCase();

    if (!search) {
      return this.tales();
    }

    return this.tales().filter(
      (tale) =>
        tale.title.toLowerCase().includes(search) ||
        tale.description.toLowerCase().includes(search),
    );
  });

  protected readonly visibleTales = computed(() =>
    this.filteredTales().slice(0, this.visibleResultsCount()),
  );

  protected readonly canShowMore = computed(
    () => this.visibleResultsCount() < this.filteredTales().length,
  );

  protected showMoreResults(): void {
    this.visibleResultsCount.update((count) =>
      Math.min(count + this.resultsStep, this.filteredTales().length),
    );
  }

  protected showLessResults(): void {
    this.visibleResultsCount.set(this.resultsStep);
  }

  protected toggleResultsView(): void {
    this.isGridView.update((isGrid) => !isGrid);
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
      {
        id: 7,
        title: 'Tale 7',
        description: 'Description 7',
        coverUrl: 'assets/images/tales-test.png',
        likes: 11,
        isFavorite: true,
        languages: ['en'],
        themes: ['adventure'],
      },
      {
        id: 8,
        title: 'Tale 8',
        description: 'Description 8',
        coverUrl: 'assets/images/tales-test.png',
        likes: 6,
        isFavorite: false,
        languages: ['es'],
        themes: ['fantasy'],
      },
      {
        id: 9,
        title: 'Tale 9',
        description: 'Description 9',
        coverUrl: 'assets/images/tales-test.png',
        likes: 4,
        isFavorite: true,
        languages: ['de'],
        themes: ['horror'],
      },
    ];
  }
}
