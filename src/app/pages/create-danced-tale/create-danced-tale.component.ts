import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { CREATE_DANCED_TALE_STEPS } from './create-danced-tale.steps';

@Component({
  imports: [RouterOutlet, TranslatePipe],
  selector: 'app-create-danced-tale',
  styleUrl: './create-danced-tale.component.scss',
  templateUrl: './create-danced-tale.component.html',
})
export class CreateDancedTaleComponent {
  private readonly router = inject(Router);

  protected readonly steps = CREATE_DANCED_TALE_STEPS;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentIndex = computed(() => {
    const segments = this.url().split(/[/?#]/);
    return Math.max(
      this.steps.findIndex((step) => segments.includes(step.path)),
      0,
    );
  });
}
