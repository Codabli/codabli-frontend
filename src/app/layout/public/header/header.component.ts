import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SearchInputComponent } from '@shared/ui/search-input/search-input.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AppLanguage } from '@models/types/app-language.type';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [
    RouterLink,
    NavbarComponent,
    SearchInputComponent,
    IconComponent,
    ButtonComponent,
    TranslatePipe,
  ],
  selector: 'app-header',
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly languageService = inject(LanguageService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly authService = inject(AuthService);

  readonly isLanguageMenuOpen = signal(false);
  readonly isProfileMenuOpen = signal(false);
  protected readonly isAuthenticated = this.authService.isLoggedIn;

  private readonly languageSelector =
    viewChild<ElementRef<HTMLElement>>('languageSelector');
  private readonly profileSelector =
    viewChild<ElementRef<HTMLElement>>('profileSelector');

  scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });
  }

  // --- Gestion du Menu Langues ---
  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update((isOpen) => !isOpen);
    if (this.isLanguageMenuOpen()) {
      this.isProfileMenuOpen.set(false); // Ferme le profil par précaution
    }
  }

  selectLanguage(language: AppLanguage): void {
    this.languageService.changeLanguage(language);
    this.isLanguageMenuOpen.set(false);
  }

  // --- Gestion du Menu Profil ---
  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((isOpen) => !isOpen);
    if (this.isProfileMenuOpen()) {
      this.isLanguageMenuOpen.set(false); // Ferme les langues par précaution
    }
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    // Fermeture du menu Langues si cliqué à l'extérieur
    if (this.isLanguageMenuOpen()) {
      const langEl = this.languageSelector()?.nativeElement;
      if (langEl && !langEl.contains(target)) {
        this.isLanguageMenuOpen.set(false);
      }
    }

    // Fermeture du menu Profil si cliqué à l'extérieur
    if (this.isProfileMenuOpen()) {
      const profEl = this.profileSelector()?.nativeElement;
      if (profEl && !profEl.contains(target)) {
        this.isProfileMenuOpen.set(false);
      }
    }
  }
}
