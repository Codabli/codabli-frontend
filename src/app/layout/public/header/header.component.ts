import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { AppLanguage } from '../../../models/types/app-language.type';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  imports: [NavbarComponent, SearchInputComponent, Icon],
  selector: 'app-header',
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly languageService = inject(LanguageService);

  readonly isLanguageMenuOpen = signal(false);

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update((isOpen) => !isOpen);  
  }

  selectLanguage(language: AppLanguage): void {
    this.languageService.changeLanguage(language);
    this.isLanguageMenuOpen.set(false);
  }
}
