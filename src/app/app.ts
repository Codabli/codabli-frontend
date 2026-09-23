import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactComponent } from './pages/contact/contact.component';

@Component({
  imports: [RouterOutlet, ContactComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('codabli-frontend');
}
