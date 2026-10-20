import {
  Component,
  input,
  output,
  signal,
  computed,
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
  readonly value = input.required<string | null>();
  readonly options = input.required<FilterSelectOption[]>();

  protected readonly isOpen = signal(false);

  readonly selectionChange = output<string>();

  protected readonly selectedValue = signal<string | null>(null);

  protected readonly selectedLabel = computed(() => {
    const option = this.options().find(
      (option) => option.value === this.value(),
    );

    return option?.label ?? this.placeholder();
  });

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }

  protected selectOption(value: string): void {
    this.selectedValue.set(value);
    this.selectionChange.emit(value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
