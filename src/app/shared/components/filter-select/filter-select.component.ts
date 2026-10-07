import {
  Component,
  input,
  signal,
  inject,
  ElementRef,
  HostListener,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FilterSelectOption } from '@models/interfaces/filter-select-option.interface';

@Component({
  imports: [IconComponent],
  selector: 'app-filter-select',
  styleUrl: './filter-select.component.scss',
  templateUrl: './filter-select.component.html',
})
export class FilterSelectComponent {
  private readonly elementRef = inject(ElementRef);

  readonly placeholder = input.required<string>();
  readonly options = input.required<FilterSelectOption[]>();

  protected readonly isOpen = signal(false);

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
