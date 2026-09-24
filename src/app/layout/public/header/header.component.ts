import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { Icon } from '../../../shared/components/icon/icon.component';

@Component({
  imports: [NavbarComponent, SearchInputComponent, Icon],
  selector: 'app-header',
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent {}
