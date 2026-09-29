import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './layouts/public/footer/footer.component';

@Component({
  imports: [RouterOutlet, FooterComponent],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly title = signal('codabli-frontend');
}
