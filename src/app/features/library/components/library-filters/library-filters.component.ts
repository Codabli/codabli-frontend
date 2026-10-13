import { Component, signal, output } from '@angular/core';
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

  protected readonly themeOptions = signal<FilterSelectOption[]>([]);
  protected readonly languageOptions = signal<FilterSelectOption[]>([]);
  protected readonly ageOptions = signal<FilterSelectOption[]>([]);

  protected onSearch(value: string): void {
    this.search.set(value);
  }

  protected applyFilters(): void {
    this.filtersChange.emit({
      search: this.search(),
      themes: [],
      languages: [],
    });
  }

  protected resetFilters(): void {
    this.search.set('');
    this.filtersChange.emit({
      search: '',
      themes: [],
      languages: [],
    });
  }
}
