import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { RichTextEditor } from './rich-text-editor.component';

@Component({
  imports: [RichTextEditor],
  template: `
    <app-rich-text-editor
      [label]="label()"
      describedBy="aide"
      [content]="content()"
      (contentChange)="changes.push($event)"
    />
  `,
})
class HostComponent {
  readonly label = signal("Texte de l'étape");
  readonly content = signal('<p>Il était une fois</p>');
  readonly changes: string[] = [];
}

describe('RichTextEditor', () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  function editable(): HTMLElement {
    return element.querySelector<HTMLElement>('[contenteditable]')!;
  }

  function toolbarButtons(): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button'));
  }

  function editorInstance() {
    // Accès direct à l'éditeur Tiptap pour simuler une saisie (jsdom ne gère pas la frappe).
    const component = fixture.debugElement.children[0].componentInstance as RichTextEditor;
    return (component as unknown as { editor: import('@tiptap/core').Editor }).editor;
  }

  it('affiche le contenu initial dans une zone de saisie accessible', () => {
    expect(editable().innerHTML).toContain('Il était une fois');
    expect(editable().getAttribute('role')).toBe('textbox');
    expect(editable().getAttribute('aria-multiline')).toBe('true');
    expect(editable().getAttribute('aria-label')).toBe("Texte de l'étape");
    expect(editable().getAttribute('aria-describedby')).toBe('aide');
  });

  it('met à jour son nom accessible quand le libellé change (traductions chargées après coup)', async () => {
    fixture.componentInstance.label.set('Text of the step');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(editable().getAttribute('aria-label')).toBe('Text of the step');
  });

  it('émet le HTML à chaque modification, et une chaîne vide si le texte est effacé', () => {
    editorInstance().commands.setContent('<p>Un dragon</p>', { emitUpdate: true });
    editorInstance().commands.setContent('', { emitUpdate: true });

    expect(fixture.componentInstance.changes).toEqual(['<p>Un dragon</p>', '']);
  });

  it('annule et rétablit une modification', async () => {
    const [, , , , , undo, redo] = toolbarButtons();
    expect(undo.disabled).toBe(true);

    editorInstance().chain().focus('end').insertContent(' au château').run();
    fixture.detectChanges();
    expect(undo.disabled).toBe(false);

    undo.click();
    fixture.detectChanges();
    expect(editable().textContent).toBe('Il était une fois');
    expect(redo.disabled).toBe(false);

    redo.click();
    fixture.detectChanges();
    expect(editable().textContent).toBe('Il était une fois au château');
  });

  function html(): string {
    return editorInstance().getHTML();
  }

  it('ne met en titre que le texte sélectionné', () => {
    const [title] = toolbarButtons();
    // « Il était une fois » : « était » occupe les positions 4 à 9.
    editorInstance().commands.setTextSelection({ from: 4, to: 9 });

    title.click();
    fixture.detectChanges();

    expect(html()).toBe('<p>Il </p><h4>était</h4><p> une fois</p>');
    expect(title.getAttribute('aria-pressed')).toBe('true');
  });

  it('sans sélection, met en titre les prochaines frappes sans toucher au texte écrit', () => {
    const [title] = toolbarButtons();
    editorInstance().commands.focus('end');

    title.click();
    editorInstance().commands.insertContent('Chapitre 1');

    expect(html()).toContain('<p>Il était une fois</p><h4>Chapitre 1</h4>');
  });

  it('sans sélection au milieu d\'un paragraphe, insère le titre au curseur', () => {
    const [, subtitle] = toolbarButtons();
    editorInstance().commands.setTextSelection(3);

    subtitle.click();
    editorInstance().commands.insertContent('Au château');

    expect(html()).toBe('<p>Il</p><h5>Au château</h5><p> était une fois</p>');
  });

  it('dans un titre, le bouton le retransforme en texte normal', () => {
    const [title] = toolbarButtons();
    editorInstance().commands.setContent('<h4>Chapitre 1</h4><p>Suite</p>');
    editorInstance().commands.setTextSelection(3);

    title.click();

    expect(html()).toBe('<p>Chapitre 1</p><p>Suite</p>');
  });

  it('met le texte sélectionné en gras et l\'indique sur le bouton', () => {
    const [, , bold] = toolbarButtons();

    editorInstance().commands.selectAll();
    bold.click();
    fixture.detectChanges();

    expect(editable().querySelector('strong')).not.toBeNull();
    expect(bold.getAttribute('aria-pressed')).toBe('true');
  });
});
