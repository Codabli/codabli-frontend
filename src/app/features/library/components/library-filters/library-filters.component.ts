import { Component, signal, output, input } from '@angular/core';
import type { FilterSelectOption } from '@models/interfaces/filter-select-option.interface';
import type { TaleFilters } from '@models/interfaces/tale-filters.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';

@Component({
  imports: [
    TranslatePipe,
    ButtonComponent,
    IconComponent,
    FilterSelectComponent,
  ],
  selector: 'app-library-filters',
  styleUrl: './library-filters.component.scss',
  templateUrl: './library-filters.component.html',
})
export class LibraryFiltersComponent {
  protected readonly search = signal('');

  readonly filtersChange = output<TaleFilters>();

  readonly themeOptions = input<FilterSelectOption[]>([]);
  readonly languageOptions = input<FilterSelectOption[]>([]);
  readonly ageOptions = input<FilterSelectOption[]>([]);

  protected readonly selectedTheme = signal<string | null>(null);
  protected readonly selectedLanguage = signal<string | null>(null);
  protected readonly selectedAge = signal<number | null>(null);

  protected onSearch(value: string): void {
    this.search.set(value);
  }

  protected applySelectedFilters(): void {
    this.filtersChange.emit({
      search: this.search(),
      themes: this.selectedTheme() ? [this.selectedTheme()!] : [],
      languages: this.selectedLanguage() ? [this.selectedLanguage()!] : [],
      age: this.selectedAge(),
    });
  }

  protected applyFilters(): void {
    this.applySelectedFilters();
  }

  protected resetFilters(): void {
    this.search.set('');
    this.selectedTheme.set(null);
    this.selectedLanguage.set(null);
    this.selectedAge.set(null);
    this.filtersChange.emit({
      search: '',
      themes: [],
      languages: [],
      age: null,
    });
  }
}
