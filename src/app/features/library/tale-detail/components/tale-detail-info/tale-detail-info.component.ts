import { Component, input, output, computed } from '@angular/core';
import { ConteDanse } from '@models/interfaces/conte-danse.interface';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';
import { FilterSelectOption } from '@models/interfaces/filter-select-option.interface';
import { getLanguageName } from '@shared/utils/language.utils';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  imports: [FilterSelectComponent, TranslatePipe, ButtonComponent],
  selector: 'app-tale-detail-info',
  styleUrl: './tale-detail-info.component.scss',
  templateUrl: './tale-detail-info.component.html',
})
export class TaleDetailInfoComponent {
  readonly conte = input.required<ConteDanse>();

  readonly availableLanguages = input<string[]>([]);
  readonly selectedLanguage = input<string | null>(null);

  readonly languageChange = output<string>();

  protected readonly languageOptions = computed<FilterSelectOption[]>(() =>
  this.availableLanguages().map((language) => ({
    value: language,
    label: getLanguageName(language),
  })),
);
}
