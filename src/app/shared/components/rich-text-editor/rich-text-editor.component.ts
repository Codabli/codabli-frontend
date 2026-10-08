import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { TranslatePipe } from '@ngx-translate/core';

interface ToolbarState {
  title: boolean;
  subtitle: boolean;
  bold: boolean;
  italic: boolean;
  bulletList: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Niveaux des titres dans le texte : l'éditeur est placé sous un titre de niveau 3
 * (titre de l'étape), « Titre » produit donc un h4 et « Sous-titre » un h5.
 */
const TITLE_LEVEL = 4;
const SUBTITLE_LEVEL = 5;

const EMPTY_STATE: ToolbarState = {
  title: false,
  subtitle: false,
  bold: false,
  italic: false,
  bulletList: false,
  canUndo: false,
  canRedo: false,
};

/**
 * Éditeur de texte enrichi (Tiptap) : titre, sous-titre, gras, italique, liste à puces,
 * annuler / rétablir.
 *
 * `content` n'est lu qu'à la création : pour changer de texte (ex. une autre étape),
 * recréer le composant, ce qui remet aussi l'historique annuler / rétablir à zéro.
 */
@Component({
  imports: [TranslatePipe],
  selector: 'app-rich-text-editor',
  styleUrl: './rich-text-editor.component.scss',
  templateUrl: './rich-text-editor.component.html',
  // Le contenu est généré par ProseMirror, hors du gabarit Angular : styles non encapsulés,
  // tous préfixés par .rich-text.
  encapsulation: ViewEncapsulation.None,
})
export class RichTextEditor {
  readonly content = input('');
  /** Nom accessible de la zone de saisie. */
  readonly label = input.required<string>();
  readonly describedBy = input<string | null>(null);
  readonly placeholder = input('');

  readonly contentChange = output<string>();

  private readonly editorHost = viewChild.required<ElementRef<HTMLElement>>('editorHost');
  private editor: Editor | null = null;

  protected readonly state = signal<ToolbarState>(EMPTY_STATE);

  constructor() {
    afterNextRender(() => this.createEditor());
    inject(DestroyRef).onDestroy(() => this.editor?.destroy());

    // Les libellés peuvent changer après la création (traductions chargées, changement de langue).
    effect(() => {
      const attributes = this.attributes();
      this.placeholder();

      if (this.editor && !this.editor.isDestroyed) {
        this.editor.setOptions({ editorProps: { attributes } });
        // Transaction vide : redessine le texte d'aide de l'extension Placeholder.
        this.editor.view.dispatch(this.editor.state.tr);
      }
    });
  }

  focus(): void {
    this.editor?.commands.focus();
  }

  protected toggleTitle(): void {
    this.applyHeading(TITLE_LEVEL);
  }

  protected toggleSubtitle(): void {
    this.applyHeading(SUBTITLE_LEVEL);
  }

  /**
   * Un titre est un bloc entier dans ProseMirror. Pour ne pas transformer tout un paragraphe :
   * - avec une sélection dans un paragraphe, seul le texte sélectionné devient un titre ;
   * - sans sélection, un titre vide est créé au curseur pour les prochaines frappes ;
   * - dans un titre, ou sur plusieurs blocs, le bouton bascule les blocs entiers.
   */
  private applyHeading(level: number): void {
    const editor = this.editor;

    if (!editor) {
      return;
    }

    const { $from, $to } = editor.state.selection;

    if ($from.parent.type.name === 'heading' || !$from.sameParent($to) || !$from.parent.isTextblock) {
      editor.chain().focus().toggleHeading({ level: level as 4 | 5 }).run();
      return;
    }

    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        const heading = state.schema.nodes['heading'];
        const { from, to, empty } = tr.selection;
        const size = tr.selection.$from.parent.content.size;
        const startOffset = tr.selection.$from.parentOffset;
        const endOffset = tr.selection.$to.parentOffset;

        if (empty) {
          if (size === 0) {
            tr.setBlockType(from, from, heading, { level });
            return true;
          }

          // Curseur au milieu : le paragraphe est coupé, le texte qui suit reste un paragraphe.
          let pos = from;
          if (startOffset > 0 && startOffset < size) {
            tr.split(pos);
            pos += 2;
          }

          const $pos = tr.doc.resolve(pos);
          const insertAt = startOffset === size ? $pos.after() : $pos.before();
          tr.insert(insertAt, heading.create({ level }));
          tr.setSelection(TextSelection.create(tr.doc, insertAt + 1));
          return true;
        }

        // Le texte sélectionné est isolé dans son propre bloc, puis transformé en titre.
        if (endOffset < size) {
          tr.split(to);
        }

        let start = from;
        if (startOffset > 0) {
          tr.split(from);
          start += 2;
        }

        const end = start + (to - from);
        tr.setBlockType(start, end, heading, { level });
        tr.setSelection(TextSelection.create(tr.doc, start, end));
        return true;
      })
      .run();
  }

  protected toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  protected toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  protected toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  protected undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  protected redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  private readonly attributes = computed(() => {
    const attributes: Record<string, string> = {
      class: 'rich-text__content',
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': this.label(),
    };
    const describedBy = this.describedBy();

    if (describedBy) {
      attributes['aria-describedby'] = describedBy;
    }

    return attributes;
  });

  private createEditor(): void {
    this.editor = new Editor({
      element: this.editorHost().nativeElement,
      extensions: [
        // Mise en forme volontairement limitée : un récit, pas une mise en page.
        StarterKit.configure({
          blockquote: false,
          code: false,
          codeBlock: false,
          heading: { levels: [TITLE_LEVEL, SUBTITLE_LEVEL] },
          horizontalRule: false,
          link: false,
          orderedList: false,
          strike: false,
          underline: false,
        }),
        // Fonction : relue à chaque rendu, donc toujours dans la langue courante.
        Placeholder.configure({ placeholder: () => this.placeholder() }),
      ],
      content: this.content() || '',
      editorProps: { attributes: this.attributes() },
      onUpdate: ({ editor }) => {
        this.contentChange.emit(editor.isEmpty ? '' : editor.getHTML());
      },
      onTransaction: () => this.refreshState(),
    });

    this.refreshState();
  }

  private refreshState(): void {
    const editor = this.editor;

    if (!editor) {
      return;
    }

    this.state.set({
      title: editor.isActive('heading', { level: TITLE_LEVEL }),
      subtitle: editor.isActive('heading', { level: SUBTITLE_LEVEL }),
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      bulletList: editor.isActive('bulletList'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    });
  }
}
