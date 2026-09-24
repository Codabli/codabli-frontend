import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  imports: [RouterOutlet, HeaderComponent],
  selector: 'app-main-layout',
  styleUrl: './main-layout.component.scss',
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  
}
