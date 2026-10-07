import { ProjectContextForm, SECRET_INGREDIENT_MAX_LENGTH } from './project-context.form';
import { ProjectContext } from '../../../models/interfaces/project-context.interface';

describe('ProjectContextForm', () => {
  let form: ProjectContextForm;

  beforeEach(() => {
    form = new ProjectContextForm();
  });

  describe('RG-CMC-01 : champs obligatoires', () => {
    it('est invalide tant que tranche d\'âge, pays, région et thème sont vides', () => {
      expect(form.valid).toBe(false);
      expect(form.controls.ageRange.hasError('required')).toBe(true);
      expect(form.controls.country.hasError('required')).toBe(true);
      expect(form.controls.region.hasError('required')).toBe(true);
      expect(form.controls.theme.hasError('required')).toBe(true);
    });

    it('refuse un pays, une région ou un thème composé uniquement d\'espaces', () => {
      form.patchValue({ country: '   ', region: '  ', theme: ' ' });

      expect(form.controls.country.hasError('required')).toBe(true);
      expect(form.controls.region.hasError('required')).toBe(true);
      expect(form.controls.theme.hasError('required')).toBe(true);
    });

    it('est valide avec les seuls champs obligatoires', () => {
      form.patchValue({ ageRange: '6-8', country: 'France', region: 'Bretagne', theme: 'Fantastique' });

      expect(form.valid).toBe(true);
    });
  });

  describe('RG-CMC-02 : ingrédients secrets', () => {
    it('ajoute un mot-clé nettoyé de ses espaces', () => {
      expect(form.addSecretIngredient('  dragons ')).toBe(true);
      expect(form.controls.secretIngredients.value).toEqual(['dragons']);
    });

    it('ignore un mot-clé vide', () => {
      expect(form.addSecretIngredient('   ')).toBe(false);
      expect(form.controls.secretIngredients.value).toEqual([]);
    });

    it('ignore un doublon, sans tenir compte de la casse', () => {
      form.addSecretIngredient('Dragons');

      expect(form.addSecretIngredient('dragons')).toBe(false);
      expect(form.controls.secretIngredients.value).toEqual(['Dragons']);
    });

    it('tronque un mot-clé trop long', () => {
      form.addSecretIngredient('a'.repeat(SECRET_INGREDIENT_MAX_LENGTH + 10));

      expect(form.controls.secretIngredients.value[0]).toHaveLength(SECRET_INGREDIENT_MAX_LENGTH);
    });

    it('retire un mot-clé par son index', () => {
      form.addSecretIngredient('châteaux forts');
      form.addSecretIngredient('dragons');
      form.addSecretIngredient('voyage dans le temps');

      form.removeSecretIngredient(1);

      expect(form.controls.secretIngredients.value).toEqual(['châteaux forts', 'voyage dans le temps']);
    });
  });

  it('convertit le formulaire en ProjectContext et inversement', () => {
    const context: ProjectContext = {
      ageRange: '9-11',
      country: 'France',
      region: 'Centre-Val de Loire',
      city: 'Tours',
      theme: 'Le Moyen Âge',
      secretIngredients: ['châteaux forts'],
      performanceSpace: 'gymnase',
    };

    form.fromProjectContext(context);

    expect(form.valid).toBe(true);
    expect(form.toProjectContext()).toEqual(context);
  });

  describe('brouillon d\'une version précédente (localStorage)', () => {
    it('reprend les champs présents et laisse les autres à leur valeur par défaut', () => {
      // Brouillon d'une version précédente : ni ingrédients, ni espace, ni ville.
      const ancienBrouillon = { ageRange: '6-8', country: 'France', region: 'Bretagne', theme: 'Nature' };

      expect(() => form.fromProjectContext(ancienBrouillon as Partial<ProjectContext>)).not.toThrow();
      expect(form.getRawValue()).toEqual({
        ageRange: '6-8',
        country: 'France',
        region: 'Bretagne',
        city: '',
        theme: 'Nature',
        secretIngredients: [],
        performanceSpace: null,
      });
      expect(form.valid).toBe(true);
    });

    it('ne plante pas sur un contexte vide', () => {
      expect(() => form.fromProjectContext({})).not.toThrow();
      expect(form.valid).toBe(false);
    });
  });

  it('nettoie les espaces des champs texte à la conversion', () => {
    form.patchValue({ ageRange: '3-5', region: ' Bretagne ', theme: ' Nature ', city: ' Brest ' });

    expect(form.toProjectContext()).toMatchObject({
      region: 'Bretagne',
      theme: 'Nature',
      city: 'Brest',
    });
  });
});
