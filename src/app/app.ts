import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './layouts/public/footer/footer.component';

@Component({
  imports: [RouterOutlet, FooterComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('codabli-frontend');
}
