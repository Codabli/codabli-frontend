import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TaleClassResourcesComponent } from './tale-class-resources.component';
import { ClassResourceFileStore } from '@core/services/class-resource-file-store.service';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { ClassResource } from '@models/interfaces/tale-class-resources.interface';

const flush = () => new Promise((resolve) => setTimeout(resolve));

/** Faux stockage en mémoire : jsdom n'a pas IndexedDB. */
class MemoryStore {
  readonly files = new Map<string, Blob>();
  failNextPut = false;

  put = vi.fn(async (id: string, file: Blob) => {
    if (this.failNextPut) {
      throw new Error('quota');
    }
    this.files.set(id, file);
  });
  get = vi.fn(async (id: string) => this.files.get(id));
  delete = vi.fn(async (id: string) => void this.files.delete(id));
}

const DRAWING: ClassResource = {
  id: 'r1',
  kind: 'image',
  name: 'Dessin du château',
  addedAt: '2026-10-12T10:00:00.000Z',
  visibility: 'private',
  fileId: 'f1',
  fileName: 'chateau.png',
  mimeType: 'image/png',
  size: 2048,
  rightsConfirmed: true,
};

const LINK: ClassResource = {
  id: 'r2',
  kind: 'link',
  name: 'Vidéo',
  addedAt: '2026-10-12T10:00:00.000Z',
  visibility: 'private',
  url: 'https://www.youtube.com/watch?v=abc',
};

function file(name: string, type: string, size = 1000): File {
  const result = new File(['x'], name, { type });
  Object.defineProperty(result, 'size', { value: size });
  return result;
}

describe('TaleClassResourcesComponent', () => {
  let fixture: ComponentFixture<TaleClassResourcesComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;
  let store: MemoryStore;
  const createObjectURL = URL.createObjectURL;
  const revokeObjectURL = URL.revokeObjectURL;

  async function setup(items?: ClassResource[], storedFiles: string[] = []): Promise<void> {
    store = new MemoryStore();
    storedFiles.forEach((id) => store.files.set(id, new Blob(['x'])));
    URL.createObjectURL = vi.fn(() => 'blob:fake');
    URL.revokeObjectURL = vi.fn();

    await TestBed.configureTestingModule({
      imports: [TaleClassResourcesComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ClassResourceFileStore, useValue: store },
      ],
    }).compileComponents();

    draftService = TestBed.inject(CreateDancedTaleDraftService);
    draftService.saveContext({
      ageRange: '6-8',
      country: 'France',
      region: 'Bretagne',
      city: '',
      theme: 'Le Moyen Âge',
      secretIngredients: [],
      performanceSpace: null,
    });
    if (items) {
      draftService.saveClassResources({ items });
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaleClassResourcesComponent);
    element = fixture.nativeElement;
    document.body.appendChild(element);
    await fixture.whenStable();
    await flush();
    await fixture.whenStable();
  }

  afterEach(() => {
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    document.body.innerHTML = '';
  });

  async function confirmRights(): Promise<void> {
    const checkbox = element.querySelector<HTMLInputElement>('#class-resources-rights')!;
    checkbox.click();
    await fixture.whenStable();
  }

  async function upload(...files: File[]): Promise<void> {
    const input = element.querySelector<HTMLInputElement>('#class-resources-file')!;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
    await flush();
    await fixture.whenStable();
  }

  async function addLink(url: string, name = ''): Promise<void> {
    const urlInput = element.querySelector<HTMLInputElement>('#class-resources-link-url')!;
    const nameInput = element.querySelector<HTMLInputElement>('#class-resources-link-name')!;
    urlInput.value = url;
    urlInput.dispatchEvent(new Event('input'));
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  function cards(): HTMLElement[] {
    return Array.from(element.querySelectorAll<HTMLElement>('.card'));
  }

  function titles(): string[] {
    return Array.from(element.querySelectorAll('.card__title')).map((title) => title.textContent!.trim());
  }

  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await fixture.whenStable();
  }

  it('affiche une liste vide et la case d\'attestation des droits, décochée', async () => {
    await setup();

    expect(cards()).toHaveLength(0);
    expect(element.textContent).toContain('createDancedTale.classResources.list.empty');
    expect(element.querySelector<HTMLInputElement>('#class-resources-rights')!.checked).toBe(false);
    expect(element.querySelector<HTMLInputElement>('#class-resources-file')!.multiple).toBe(true);
  });

  it('refuse le dépôt tant que les droits d\'utilisation ne sont pas attestés', async () => {
    await setup();

    await upload(file('dessin.png', 'image/png'));

    expect(store.put).not.toHaveBeenCalled();
    expect(cards()).toHaveLength(0);
    expect(element.querySelector('#rights-error')).not.toBeNull();
    expect(element.querySelector('#class-resources-rights')!.getAttribute('aria-invalid')).toBe('true');

    await confirmRights();
    expect(element.querySelector('#rights-error')).toBeNull();
  });

  it('dépose plusieurs fichiers d\'un coup, privés et avec l\'attestation des droits', async () => {
    await setup();
    await confirmRights();

    await upload(file('dessin.png', 'image/png'), file('fiche.pdf', 'application/pdf', 3 * 1024 * 1024));

    expect(titles()).toEqual(['dessin', 'fiche']);
    expect(store.files.size).toBe(2);
    const items = draftService.classResources()!.items;
    expect(items.map((item) => item.kind)).toEqual(['image', 'pdf']);
    expect(items.every((item) => item.visibility === 'private' && item.rightsConfirmed)).toBe(true);
    expect(cards()[0].querySelector('.card__private')).not.toBeNull();
    expect(cards()[0].querySelector('img')!.getAttribute('src')).toBe('blob:fake');
    expect(cards()[1].querySelector('.card__icon')).not.toBeNull();
  });

  it('signale les fichiers refusés (format, taille, stockage) sans bloquer les autres', async () => {
    await setup();
    await confirmRights();

    await upload(
      file('texte.docx', 'application/msword'),
      file('film.mp4', 'video/mp4', 200 * 1024 * 1024),
      file('chanson.mp3', 'audio/mpeg'),
    );

    expect(titles()).toEqual(['chanson']);
    const errors = Array.from(element.querySelectorAll('.rejected li')).map((item) => item.textContent!.trim());
    expect(errors).toEqual([
      'createDancedTale.classResources.upload.errors.format',
      'createDancedTale.classResources.upload.errors.tooLarge',
    ]);

    store.failNextPut = true;
    await upload(file('photo.jpg', 'image/jpeg'));
    expect(element.querySelector('.rejected')!.textContent).toContain(
      'createDancedTale.classResources.upload.errors.storage',
    );
    expect(titles()).toEqual(['chanson']);
  });

  it('accepte les fichiers glissés dans la zone de dépôt', async () => {
    await setup();
    await confirmRights();
    const drop = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: unknown };
    drop.dataTransfer = { files: [file('photo.jpg', 'image/jpeg')] };

    element.querySelector('.dropzone')!.dispatchEvent(drop);
    await flush();
    await fixture.whenStable();

    expect(drop.defaultPrevented).toBe(true);
    expect(titles()).toEqual(['photo']);
  });

  it('ajoute un lien, nommé d\'après son site par défaut', async () => {
    await setup();

    await addLink('https://www.youtube.com/watch?v=abc');

    expect(titles()).toEqual(['youtube.com']);
    expect(draftService.classResources()!.items[0]).toMatchObject({
      kind: 'link',
      url: 'https://www.youtube.com/watch?v=abc',
      visibility: 'private',
    });
    expect(cards()[0].querySelector('.fa-youtube')).not.toBeNull();
    expect(element.querySelector<HTMLInputElement>('#class-resources-link-url')!.value).toBe('');
  });

  it('refuse un lien incomplet', async () => {
    await setup();

    await addLink('www.exemple.fr', 'Mon site');

    expect(cards()).toHaveLength(0);
    expect(element.querySelector('#link-error')).not.toBeNull();
  });

  it('reprend les documents enregistrés et signale un fichier absent de cet appareil', async () => {
    await setup([DRAWING, LINK]);

    expect(titles()).toEqual(['Dessin du château', 'Vidéo']);
    expect(cards()[0].querySelector('.card__missing')).not.toBeNull();
    expect(element.querySelector('.documents__count')!.textContent).toContain(
      'createDancedTale.classResources.list.count',
    );
  });

  it('renomme un document avec Entrée, ou annule avec Échap', async () => {
    await setup([DRAWING], ['f1']);

    await click(element.querySelector<HTMLButtonElement>('#rename-button-r1')!);
    let input = element.querySelector<HTMLInputElement>('#rename-r1')!;
    input.value = 'Château de Léa';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(titles()).toEqual(['Château de Léa']);
    expect(draftService.classResources()!.items[0].name).toBe('Château de Léa');

    await click(element.querySelector<HTMLButtonElement>('#rename-button-r1')!);
    input = element.querySelector<HTMLInputElement>('#rename-r1')!;
    input.value = 'Autre nom';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(titles()).toEqual(['Château de Léa']);
  });

  it('garde l\'ancien nom si le nouveau est vide', async () => {
    await setup([DRAWING], ['f1']);

    await click(element.querySelector<HTMLButtonElement>('#rename-button-r1')!);
    const input = element.querySelector<HTMLInputElement>('#rename-r1')!;
    input.value = '   ';
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(titles()).toEqual(['Dessin du château']);
  });

  it('supprime un document après confirmation, fichier compris', async () => {
    await setup([DRAWING, LINK], ['f1']);

    await click(cards()[0].querySelector<HTMLButtonElement>('.action--danger')!);
    const dialog = element.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('createDancedTale.classResources.delete.message');

    await click(dialog.querySelector<HTMLButtonElement>('.action--confirm-delete')!);
    await flush();

    expect(titles()).toEqual(['Vidéo']);
    expect(store.delete).toHaveBeenCalledWith('f1');
    expect(draftService.classResources()!.items).toEqual([LINK]);
  });

  it('n\'efface rien si l\'on annule la suppression', async () => {
    await setup([DRAWING], ['f1']);

    await click(cards()[0].querySelector<HTMLButtonElement>('.action--danger')!);
    await click(element.querySelector<HTMLButtonElement>('[role="dialog"] .detail__actions .action')!);

    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(titles()).toEqual(['Dessin du château']);
    expect(store.delete).not.toHaveBeenCalled();
  });

  it('prévisualise une image et un lien', async () => {
    await setup([DRAWING, LINK], ['f1']);

    await click(cards()[0].querySelector<HTMLButtonElement>('.action--main')!);
    expect(element.querySelector('[role="dialog"] img')!.getAttribute('src')).toBe('blob:fake');

    await click(element.querySelector<HTMLButtonElement>('.modal__close')!);
    await click(cards()[1].querySelector<HTMLButtonElement>('.action--main')!);
    const link = element.querySelector<HTMLAnchorElement>('[role="dialog"] .open-link')!;
    expect(link.getAttribute('href')).toBe('https://www.youtube.com/watch?v=abc');
    expect(link.target).toBe('_blank');
  });

  it('revient aux ressources culturelles ou passe à l\'univers du conte', async () => {
    await setup();
    const buttons = element.querySelectorAll<HTMLButtonElement>('.resource-screen__actions app-button button');

    buttons[0].click();
    expect(router.navigate).toHaveBeenCalledWith(['../resources'], expect.anything());

    buttons[1].click();
    expect(router.navigate).toHaveBeenCalledWith(['../universe'], expect.anything());
  });
});
