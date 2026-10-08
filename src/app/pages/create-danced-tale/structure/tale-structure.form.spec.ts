import { DEFAULT_STORY_STEPS, TaleStructure } from '../../../models/interfaces/tale-structure.interface';
import { StoryStepForm, TaleStructureForm } from './tale-structure.form';

const TITLES: Record<string, string> = {
  initialSituation: 'La situation initiale',
  trigger: "L'élément déclencheur",
  adventures: 'Les péripéties',
  resolution: 'La résolution',
  finalSituation: 'La situation finale',
};

function titles(form: TaleStructureForm): string[] {
  return form.steps.map((step) => step.controls.title.value);
}

describe('StoryStepForm', () => {
  it('exige un titre, mais pas de résumé', () => {
    const step = new StoryStepForm();
    expect(step.valid).toBe(false);

    step.controls.title.setValue('Le départ');
    expect(step.valid).toBe(true);
  });

  it('signale une étape essentielle sans résumé, pas une étape ajoutée', () => {
    const essential = new StoryStepForm({ kind: 'trigger', title: 'Déclencheur' });
    const added = new StoryStepForm({ title: 'Une étape en plus' });

    expect(essential.isEmptyEssential).toBe(true);
    expect(added.isEmptyEssential).toBe(false);

    essential.controls.summary.setValue('  Le dragon apparaît  ');
    expect(essential.isEmptyEssential).toBe(false);
  });

  it('coche et décoche un personnage', () => {
    const step = new StoryStepForm();

    step.toggleCharacter('c1');
    step.toggleCharacter('c2');
    step.toggleCharacter('c1');

    expect(step.controls.characterIds.value).toEqual(['c2']);
    expect(step.hasCharacter('c2')).toBe(true);
  });
});

describe('TaleStructureForm', () => {
  it('crée la structure par défaut avec les titres fournis (RG-CMC-09)', () => {
    const form = new TaleStructureForm();

    form.fromDefaults(DEFAULT_STORY_STEPS, TITLES);

    expect(titles(form)).toEqual(Object.values(TITLES));
    expect(form.steps.every((step) => step.isEssential)).toBe(true);
  });

  it('ajoute une étape non essentielle à la fin', () => {
    const form = new TaleStructureForm();
    form.fromDefaults(DEFAULT_STORY_STEPS, TITLES);

    const step = form.addStep();

    expect(form.steps.at(-1)).toBe(step);
    expect(step.isEssential).toBe(false);
  });

  it('réordonne les étapes (RG-CMC-10)', () => {
    const form = new TaleStructureForm();
    form.fromDefaults(DEFAULT_STORY_STEPS, TITLES);

    form.moveStep(4, 0);

    expect(titles(form)[0]).toBe('La situation finale');
    expect(titles(form)[1]).toBe('La situation initiale');

    form.moveStep(0, 9);
    expect(titles(form)[0]).toBe('La situation finale');
  });

  it('supprime une étape mais en garde toujours au moins une', () => {
    const form = new TaleStructureForm();
    form.fromDefaults(['initialSituation', 'finalSituation'], TITLES);

    form.removeStep(0);
    form.removeStep(0);

    expect(titles(form)).toEqual(['La situation finale']);
  });

  it('restitue une trame enregistrée, sans les personnages supprimés depuis', () => {
    const structure: TaleStructure = {
      steps: [{ id: 's1', kind: null, title: 'Étape', summary: 'Résumé', characterIds: ['c1', 'gone'] }],
    };
    const form = new TaleStructureForm();

    form.fromTaleStructure(structure, ['c1', 'c2']);

    expect(form.toTaleStructure()).toEqual({
      steps: [{ id: 's1', kind: null, title: 'Étape', summary: 'Résumé', characterIds: ['c1'] }],
    });
  });

  it('liste les étapes essentielles vides', () => {
    const form = new TaleStructureForm();
    form.fromDefaults(DEFAULT_STORY_STEPS, TITLES);
    form.steps[0].controls.summary.setValue('Il était une fois…');

    expect(form.emptyEssentialSteps()).toHaveLength(4);
  });
});
