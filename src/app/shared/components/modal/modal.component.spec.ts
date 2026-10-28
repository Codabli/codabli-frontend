import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Modal } from './modal.component';

@Component({
  imports: [Modal],
  template: `
    <button
      id="opener"
      type="button"
      (click)="open.set(true)"
    >
      Ouvrir
    </button>

    @if (open()) {
      <app-modal
        heading="Détails"
        (closed)="open.set(false)"
      >
        <p>Contenu</p>
        <button type="button">Action</button>
      </app-modal>
    }
  `,
})
class Host {
  readonly open = signal(false);
}

describe('Modal', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideTranslateService()],
    }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    const element: HTMLElement = fixture.nativeElement;
    document.body.appendChild(element);
    await fixture.whenStable();

    const opener = element.querySelector<HTMLButtonElement>('#opener')!;
    opener.focus();
    opener.click();
    await fixture.whenStable();

    return { fixture, element, opener };
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('est une boîte de dialogue modale nommée par son titre', async () => {
    const { element } = await setup();

    const dialog = element.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!)!;
    expect(title.textContent?.trim()).toBe('Détails');
    expect(dialog.textContent).toContain('Contenu');
  });

  it('se ferme avec Échap et rend le focus au bouton qui l\'a ouverte', async () => {
    const { fixture, element, opener } = await setup();

    element
      .querySelector('app-modal')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(element.querySelector('[role="dialog"]')).toBeNull();
    // CdkTrapFocus rend le focus de façon asynchrone.
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.activeElement).toBe(opener);
  });

  it('se ferme avec le bouton Fermer ou un clic sur le fond', async () => {
    const { fixture, element, opener } = await setup();

    element.querySelector<HTMLButtonElement>('.modal__close')!.click();
    await fixture.whenStable();
    expect(element.querySelector('[role="dialog"]')).toBeNull();

    opener.click();
    await fixture.whenStable();
    element.querySelector<HTMLElement>('.modal-backdrop')!.click();
    await fixture.whenStable();
    expect(element.querySelector('[role="dialog"]')).toBeNull();
  });
});
