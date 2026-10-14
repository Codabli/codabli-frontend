import { Component, signal, computed, inject } from '@angular/core';
import { forkJoin, map, switchMap, of } from 'rxjs';
import type { LanguageCode } from '@models/types/language-code.type';
import { TranslatePipe } from '@ngx-translate/core';
import { TaleFilters } from '@models/interfaces/tale-filters.interface';
import { Tale } from '@models/interfaces/tale.interface';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TaleCardComponent } from '@shared/components/tale-card/tale-card.component';
import { LibraryCarouselComponent } from './components/library-carousel/library-carousel.component';
import { LibraryFiltersComponent } from './components/library-filters/library-filters.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { OnInit } from '@angular/core';
import { ConteDanseService } from '@core/services/conte-danse.service';
import { mapConteDanseToTale } from '@models/mappers/conte-danse.mapper';
import type { FilterSelectOption } from '@models/interfaces/filter-select-option.interface';

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
export class LibraryComponent implements OnInit {
  protected readonly isGridView = signal(true);
  private readonly resultsStep = 8;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly conteDanseService = inject(ConteDanseService);

  protected readonly isAuthenticated = this.authService.isLoggedIn;

  protected readonly visibleResultsCount = signal(this.resultsStep);

  protected readonly allTales = signal<Tale[]>([]);

  protected readonly filters = signal<TaleFilters>({
    search: '',
    languages: [],
    themes: [],
    age: null,
  });

  protected readonly themeOptions = computed<FilterSelectOption[]>(() =>
    [...new Set(this.allTales().flatMap((tale) => tale.themes))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'fr'))
      .map((theme) => ({
        value: theme,
        label: theme,
      })),
  );

  protected readonly ageOptions = computed<FilterSelectOption[]>(() => {
    const tales = this.allTales();

    const agesMin = tales
      .map((tale) => tale.ageMin)
      .filter((age): age is number => age != null);

    const agesMax = tales
      .map((tale) => tale.ageMax)
      .filter((age): age is number => age != null);

    if (agesMin.length === 0 || agesMax.length === 0) {
      return [];
    }

    const min = Math.min(...agesMin);
    const max = Math.max(...agesMax);

    return Array.from({ length: max - min + 1 }, (_, index) => {
      const age = min + index;

      return {
        value: age.toString(),
        label: `${age} ans`,
      };
    });
  });

  protected readonly languageOptions = computed<FilterSelectOption[]>(() => {
    const displayNames = new Intl.DisplayNames(['fr'], {
      type: 'language',
    });

    return [...new Set(this.allTales().flatMap((tale) => tale.languages))]
      .map((langue) => ({
        value: langue,
        label: displayNames.of(langue) ?? langue,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  });

  ngOnInit(): void {
    this.chargerContes();
  }

  private chargerContes(): void {
    this.conteDanseService
      .listerTous()
      .pipe(
        switchMap((contes) => {
          if (contes.length === 0) {
            return of([] as Tale[]);
          }

          return forkJoin(
            contes.map((conte) =>
              this.conteDanseService.listerTraductionsPubliees(conte.id).pipe(
                map((traductions) => {
                  const tale = mapConteDanseToTale(conte);

                  return {
                    ...tale,
                    ageMin: conte.ageMin,
                    ageMax: conte.ageMax,
                    languages: [
                      ...new Set([
                        tale.originalLanguage,
                        ...traductions.map((t) => t.langue as LanguageCode),
                      ]),
                    ],
                  };
                }),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (tales) => {
          this.allTales.set(tales);
        },
        error: (error) =>
          console.error('Erreur lors du chargement des contes :', error),
      });
  }

  protected onFiltersChange(filters: TaleFilters): void {
    this.filters.set(filters);
    this.visibleResultsCount.set(this.resultsStep);
  }

  protected readonly filteredTales = computed(() => {
    const { search, themes, languages, age } = this.filters();

    const thematique = themes[0]?.toLowerCase();
    const langue = languages[0];
    const recherche = search.trim().toLowerCase();

    return this.allTales().filter((tale) => {
      const correspondThematique =
        !thematique ||
        tale.themes.some((theme) => theme.toLowerCase().includes(thematique));

      const correspondAge =
        age == null ||
        ((tale.ageMin == null || tale.ageMin <= age) &&
          (tale.ageMax == null || tale.ageMax >= age));

      const correspondLangue =
        !langue || tale.languages.includes(langue as LanguageCode);

      const correspondRecherche =
        !recherche ||
        tale.title.toLowerCase().includes(recherche) ||
        tale.description.toLowerCase().includes(recherche);

      return (
        correspondThematique &&
        correspondAge &&
        correspondLangue &&
        correspondRecherche
      );
    });
  });

  protected readonly visibleTales = computed(() =>
    this.filteredTales().slice(0, this.visibleResultsCount()),
  );

  protected readonly canShowMore = computed(
    () => this.visibleResultsCount() < this.filteredTales().length,
  );

  protected readonly canShowLess = computed(
    () => this.visibleResultsCount() > this.resultsStep,
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

  protected consultTale(taleId: string): void {
    this.router.navigate(['/library/tales', taleId]);
  }

  protected goToLogin(): void {
    this.router.navigate(['/login']);
  }

  protected adoptTale(taleId: string): void {
    // Redirection vers la boutique ??
  }
}
