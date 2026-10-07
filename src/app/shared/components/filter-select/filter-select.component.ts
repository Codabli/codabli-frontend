import { Component, input, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  imports: [IconComponent],
  selector: 'app-filter-select',
  styleUrl: './filter-select.component.scss',
  templateUrl: './filter-select.component.html',
})
export class FilterSelectComponent {
  readonly placeholder = input.required<string>();

  protected readonly isOpen = signal(false);

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }
}
