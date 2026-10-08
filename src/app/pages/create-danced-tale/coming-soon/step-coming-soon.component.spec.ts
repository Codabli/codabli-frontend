import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StepComingSoonComponent } from './step-coming-soon.component';

describe('StepComingSoonComponent', () => {
  async function render(url: string): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        provideRouter([
          {
            path: 'create-danced-tale',
            children: [
              {
                path: 'discovery',
                component: StepComingSoonComponent,
                data: { previousStep: 'context', nextStep: 'universe' },
              },
              { path: 'staging', component: StepComingSoonComponent, data: { previousStep: 'writing' } },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return harness.routeNativeElement!;
  }

  function hrefs(element: HTMLElement): (string | null)[] {
    return Array.from(element.querySelectorAll('a')).map((a) => a.getAttribute('href'));
  }

  it('propose les étapes précédente et suivante indiquées par la route', async () => {
    const element = await render('/create-danced-tale/discovery');

    expect(hrefs(element)).toEqual(['/create-danced-tale/context', '/create-danced-tale/universe']);
  });

  it('n\'affiche que le retour s\'il n\'y a pas d\'étape suivante', async () => {
    const element = await render('/create-danced-tale/staging');

    expect(hrefs(element)).toEqual(['/create-danced-tale/writing']);
  });
});
