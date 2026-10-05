import { Component, ElementRef, inject, signal, viewChild, HostListener } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SearchInputComponent } from '@shared/ui/search-input/search-input.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AppLanguage } from '@models/types/app-language.type';
import { LanguageService } from '@core/services/language.service';

@Component({
  imports: [NavbarComponent, SearchInputComponent, IconComponent],
  selector: 'app-header',
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly languageService = inject(LanguageService);

  readonly isLanguageMenuOpen = signal(false);

  private readonly languageSelector =
  viewChild<ElementRef>('languageSelector');

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update((isOpen) => !isOpen);  
  }

  selectLanguage(language: AppLanguage): void {
    this.languageService.changeLanguage(language);
    this.isLanguageMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isLanguageMenuOpen()) {
      return;
    }

    const languageSelector = this.languageSelector()?.nativeElement;
    const target = event.target as Node;

    if (languageSelector && !languageSelector.contains(target)) {
      this.isLanguageMenuOpen.set(false);
    }
  }
}
