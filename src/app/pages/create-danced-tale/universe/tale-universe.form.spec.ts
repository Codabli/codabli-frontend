import { TaleUniverse } from '../../../models/interfaces/tale-universe.interface';
import { TaleUniverseForm, UniverseCardForm } from './tale-universe.form';

const UNIVERSE: TaleUniverse = {
  places: [{ id: 'p1', name: 'La forêt', description: 'Des arbres qui chuchotent', image: 'data:image/jpeg;base64,AAA' }],
  characters: [
    { id: 'c1', name: 'Arthur', description: 'Un roi', image: null, role: 'Héros', goal: 'Trouver l\'épée' },
  ],
  periods: [{ id: 't1', name: 'Le Moyen Âge', description: '', image: null }],
  objects: [{ id: 'o1', name: 'Excalibur', description: '', image: null }],
};

describe('UniverseCardForm', () => {
  it('n\'exige que le nom pour un lieu, une époque ou un objet', () => {
    for (const section of ['places', 'periods', 'objects'] as const) {
      const card = new UniverseCardForm(section);
      expect(card.valid).toBe(false);

      card.controls.name.setValue('Nom');
      expect(card.valid).toBe(true);
    }
  });

  it('refuse un nom composé d\'espaces', () => {
    const card = new UniverseCardForm('places');
    card.controls.name.setValue('   ');

    expect(card.controls.name.hasError('required')).toBe(true);
  });

  it('exige rôle, description et objectif pour un personnage (RG-CMC-08)', () => {
    const card = new UniverseCardForm('characters');
    card.controls.name.setValue('Arthur');

    expect(card.controls.role.hasError('required')).toBe(true);
    expect(card.controls.description.hasError('required')).toBe(true);
    expect(card.controls.goal.hasError('required')).toBe(true);

    card.patchValue({ role: 'Héros', description: 'Un roi', goal: 'Régner' });
    expect(card.valid).toBe(true);
  });

  it('génère un identifiant unique par carte', () => {
    expect(new UniverseCardForm('places').controls.id.value).not.toBe(
      new UniverseCardForm('places').controls.id.value,
    );
  });
});

describe('TaleUniverseForm', () => {
  it('démarre sans carte', () => {
    const form = new TaleUniverseForm();

    expect(form.toTaleUniverse()).toEqual({ places: [], characters: [], periods: [], objects: [] });
    expect(form.valid).toBe(true);
  });

  it('ajoute et supprime des cartes', () => {
    const form = new TaleUniverseForm();
    form.addCard('places');
    const second = form.addCard('places');

    form.removeCard('places', 0);

    expect(form.controls.places.controls).toEqual([second]);
  });

  it('propose une carte vide par sous-section, sans bloquer la validation une fois retirées', () => {
    const form = new TaleUniverseForm();
    form.addDefaultCards();

    expect(Object.values(form.controls).map((cards) => cards.length)).toEqual([1, 1, 1, 1]);
    expect(form.valid).toBe(false);

    form.removeBlankCards();

    expect(form.valid).toBe(true);
  });

  it('ne retire que les cartes entièrement vides', () => {
    const form = new TaleUniverseForm();
    form.addCard('places');
    form.addCard('places').controls.description.setValue('Une grotte');
    form.addCard('objects').controls.image.setValue('data:image/jpeg;base64,AAA');

    form.removeBlankCards();

    expect(form.controls.places.length).toBe(1);
    expect(form.controls.objects.length).toBe(1);
  });

  it('n\'enregistre pas les cartes vides', () => {
    const form = new TaleUniverseForm();
    form.addDefaultCards();
    form.controls.places.at(0).controls.name.setValue('La forêt');

    const universe = form.toTaleUniverse();

    expect(universe.places).toHaveLength(1);
    expect(universe.characters).toEqual([]);
  });

  it('restitue un univers enregistré', () => {
    const form = new TaleUniverseForm();
    form.fromTaleUniverse(UNIVERSE);

    expect(form.toTaleUniverse()).toEqual(UNIVERSE);
  });

  it('nettoie les espaces et ne garde rôle et objectif que pour les personnages', () => {
    const form = new TaleUniverseForm();
    form.addCard('places').patchValue({ name: '  La grotte  ', description: ' Sombre ' });
    form.addCard('characters').patchValue({ name: ' Merlin ', role: ' Guide ', description: 'Un mage', goal: ' Aider ' });

    const universe = form.toTaleUniverse();

    expect(universe.places[0]).toEqual({ id: expect.any(String), name: 'La grotte', description: 'Sombre', image: null });
    expect(universe.characters[0]).toMatchObject({ name: 'Merlin', role: 'Guide', goal: 'Aider' });
  });
});
