import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@ngx-translate/core';
import type { NavItem } from '../../../models/interfaces/nav-item.interface';

@Component({
  imports: [RouterLink, RouterLinkActive, ButtonComponent, TranslatePipe],
  selector: 'app-navbar',
  styleUrl: './navbar.component.scss',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly navItems: NavItem[] = [
    { labelKey: 'navbar.dancedTales', route: '/library/tales' },
    { labelKey: 'navbar.interactiveGame', route: '/interactive-game' },
    { labelKey: 'navbar.storyCards', route: '/story-cards' },
    { labelKey: 'navbar.createDancedTale', route: '/create-danced-tale' },
    { labelKey: 'navbar.artGallery', route: '/art-gallery' },
    { labelKey: 'navbar.shop', route: '/shop' },
    { labelKey: 'navbar.partners', route: '/partners' },
  ];
}
