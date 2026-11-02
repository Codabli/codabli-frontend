import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, forkJoin } from 'rxjs';
import type { ApiError } from '@models/interfaces/api-error.interface';
import type { ConteDanse, ConteDanseRequest } from '@models/interfaces/conte-danse.interface';
import type { EtapeParcours, ParcoursConte } from '@models/interfaces/parcours-conte.interface';
import { ProjectContext } from '@models/interfaces/project-context.interface';
import { TaleClassResources } from '@models/interfaces/tale-class-resources.interface';
import { TaleDiscovery } from '@models/interfaces/tale-discovery.interface';
import { TaleResources } from '@models/interfaces/tale-resources.interface';
import { TaleStaging } from '@models/interfaces/tale-staging.interface';
import { TaleStructure } from '@models/interfaces/tale-structure.interface';
import { TaleUniverse } from '@models/interfaces/tale-universe.interface';
import { TaleWriting } from '@models/interfaces/tale-writing.interface';
import type { AgeRange } from '@models/types/age-range.type';
import { ConteDanseService } from './conte-danse.service';
import { ParcoursConteService } from './parcours-conte.service';

export interface CreateDancedTaleDraft {
  context: ProjectContext | null;
  discovery: TaleDiscovery | null;
  resources: TaleResources | null;
  classResources: TaleClassResources | null;
  universe: TaleUniverse | null;
  structure: TaleStructure | null;
  writing: TaleWriting | null;
  staging: TaleStaging | null;
}

const EMPTY_DRAFT: CreateDancedTaleDraft = {
  context: null,
  discovery: null,
  resources: null,
  classResources: null,
  universe: null,
  structure: null,
  writing: null,
  staging: null,
};

/** Enregistrement en échec, à relancer depuis le message d'erreur du parcours. */
interface FailedSave {
  error: ApiError;
  retry: () => Promise<boolean>;
}

/**
 * Conte en cours de création dans le parcours « Créer mon conte dansé », partagé entre les écrans.
 *
 * Le conte est un `ConteDanse` en brouillon, créé à l'écran 1 (`createTale`). Son identifiant est dans l'URL
 * du parcours et `load` le relit depuis le backend. Chaque `save*` met à jour l'état tout de suite (les écrans
 * suivants le lisent sans attendre), puis l'envoie au backend : `PUT /contes-danses/{id}/parcours/{etape}`,
 * et `PUT /contes-danses/{id}` pour ce qui appartient au conte (pays, thème, âges, titre).
 * Les envois d'une même étape partent dans l'ordre et seul le dernier en attente est envoyé.
 *
 * Les fichiers (documents de la classe, sons) restent dans le navigateur (IndexedDB) : seules leurs
 * métadonnées sont enregistrées ici, en attendant leur stockage côté serveur.
 */
@Injectable({ providedIn: 'root' })
export class CreateDancedTaleDraftService {
  private readonly conteService = inject(ConteDanseService);
  private readonly parcoursService = inject(ParcoursConteService);

  private readonly draft = signal<CreateDancedTaleDraft>(EMPTY_DRAFT);
  private readonly id = signal<string | null>(null);
  private readonly failures = signal<ReadonlyMap<string, FailedSave>>(new Map());

  /** Champs du conte voulus, renvoyés en entier à chaque `PUT /contes-danses/{id}`. */
  private conteRequest: ConteDanseRequest | null = null;
  /** Numéro du dernier envoi demandé par étape : un envoi remplacé avant de partir est abandonné. */
  private readonly latest = new Map<string, number>();
  private readonly queues = new Map<string, Promise<boolean>>();
  /** Dernier contenu enregistré par étape : un contenu inchangé n'est pas renvoyé. */
  private readonly saved = new Map<string, string>();
  private sequence = 0;

  readonly taleId = this.id.asReadonly();
  readonly context = computed(() => this.draft().context);
  readonly discovery = computed(() => this.draft().discovery);
  readonly resources = computed(() => this.draft().resources);
  readonly classResources = computed(() => this.draft().classResources);
  readonly universe = computed(() => this.draft().universe);
  readonly structure = computed(() => this.draft().structure);
  readonly writing = computed(() => this.draft().writing);
  readonly staging = computed(() => this.draft().staging);

  /** Première erreur d'enregistrement en cours, `null` si tout est enregistré. */
  readonly saveError = computed(() => this.failures().values().next().value?.error ?? null);
  /** Échec de la dernière ouverture d'un conte (`load`). */
  readonly loadError = signal<ApiError | null>(null);

  /** Nouveau conte : rien n'est envoyé au backend avant `createTale`. */
  reset(): void {
    this.draft.set(EMPTY_DRAFT);
    this.id.set(null);
    this.failures.set(new Map());
    this.conteRequest = null;
    this.latest.clear();
    this.queues.clear();
    this.saved.clear();
  }

  /** Ouvre un conte existant. Rejette avec une `ApiError` (conte introuvable, d'un autre auteur...). */
  async load(taleId: string): Promise<void> {
    try {
      const [conte, parcours] = await firstValueFrom(
        forkJoin([this.conteService.getById(taleId), this.parcoursService.lire(taleId)]),
      );
      this.reset();
      this.id.set(taleId);
      this.conteRequest = toConteRequest(conte);
      this.saved.set('conte', JSON.stringify(this.conteRequest));
      this.draft.set(toDraft(conte, parcours));
      this.loadError.set(null);
    } catch (error) {
      this.loadError.set(error as ApiError);
      throw error;
    }
  }

  /**
   * Crée le conte en brouillon à partir du contexte (écran 1) et retourne son identifiant.
   * Rejette avec une `ApiError` si le conte n'a pas pu être créé ; si seul le contexte du parcours
   * échoue, le conte est créé et l'échec est signalé comme les autres enregistrements.
   */
  async createTale(context: ProjectContext): Promise<string> {
    const conte = await firstValueFrom(this.conteService.creer(withContext(EMPTY_CONTE_REQUEST, context)));
    this.id.set(conte.id);
    this.conteRequest = toConteRequest(conte);
    this.saved.set('conte', JSON.stringify(this.conteRequest));
    this.loadError.set(null);
    await this.saveContext(context);
    return conte.id;
  }

  saveContext(context: ProjectContext): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, context }));
    return this.all([
      this.saveConte(withContext(this.conteRequest ?? EMPTY_CONTE_REQUEST, context)),
      this.send(
        'contexte',
        {
          region: context.region,
          ville: context.city || null,
          espaceRepresentation: context.performanceSpace,
          ingredientsSecrets: context.secretIngredients,
        },
        (taleId, body) => this.parcoursService.enregistrerContexte(taleId, body),
      ),
    ]);
  }

  saveDiscovery(discovery: TaleDiscovery): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, discovery }));
    return this.saveStep('decouverte', discovery);
  }

  saveResources(resources: TaleResources): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, resources }));
    return this.saveStep('ressources', resources);
  }

  saveClassResources(classResources: TaleClassResources): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, classResources }));
    return this.saveStep('ressources-classe', classResources);
  }

  saveUniverse(universe: TaleUniverse): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, universe }));
    return this.saveStep('univers', universe);
  }

  saveStructure(structure: TaleStructure): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, structure }));
    return this.saveStep('trame', structure);
  }

  /** Le titre est celui du conte ; les textes vont dans l'étape « écriture » du parcours. */
  saveWriting(writing: TaleWriting): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, writing }));
    return this.all([
      this.saveConte({ ...(this.conteRequest ?? EMPTY_CONTE_REQUEST), titre: writing.title || null }),
      this.saveStep('ecriture', { texts: writing.texts }),
    ]);
  }

  saveStaging(staging: TaleStaging): Promise<boolean> {
    this.draft.update((draft) => ({ ...draft, staging }));
    return this.saveStep('mise-en-scene', staging);
  }

  /** Relance les enregistrements en échec. */
  retryFailedSaves(): Promise<boolean> {
    return this.all([...this.failures().values()].map((failure) => failure.retry()));
  }

  private saveStep(etape: EtapeParcours, content: unknown): Promise<boolean> {
    return this.send(etape, content, (taleId, body) => this.parcoursService.enregistrerEtape(taleId, etape, body));
  }

  private saveConte(request: ConteDanseRequest): Promise<boolean> {
    this.conteRequest = request;
    return this.send('conte', request, (taleId, body) => this.conteService.modifier(taleId, body));
  }

  /**
   * Envoie `body` pour l'étape `key`, après les envois de cette étape déjà partis.
   * Sans conte créé (écran 1 d'un nouveau conte), rien n'est envoyé.
   */
  private send<T>(key: string, body: T, request: (taleId: string, body: T) => Observable<unknown>): Promise<boolean> {
    const taleId = this.id();
    const json = JSON.stringify(body);

    if (!taleId || (this.saved.get(key) === json && !this.failures().has(key))) {
      return Promise.resolve(true);
    }

    const version = ++this.sequence;
    this.latest.set(key, version);

    const run = async (): Promise<boolean> => {
      // Remplacé par un envoi plus récent, ou conte fermé entre-temps.
      if (this.latest.get(key) !== version || this.id() !== taleId) {
        return true;
      }

      try {
        await firstValueFrom(request(taleId, body));
        this.saved.set(key, json);
        this.setFailure(key, null);
        return true;
      } catch (error) {
        if (this.id() === taleId) {
          this.setFailure(key, { error: error as ApiError, retry: () => this.send(key, body, request) });
        }
        return false;
      }
    };

    const result = (this.queues.get(key) ?? Promise.resolve(true)).then(run);
    this.queues.set(key, result);
    return result;
  }

  private setFailure(key: string, failure: FailedSave | null): void {
    this.failures.update((failures) => {
      const next = new Map(failures);
      if (failure) {
        next.set(key, failure);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  private async all(saves: Promise<boolean>[]): Promise<boolean> {
    return (await Promise.all(saves)).every(Boolean);
  }
}

const EMPTY_CONTE_REQUEST: ConteDanseRequest = {
  titre: null,
  description: null,
  thematique: null,
  langueOriginale: null,
  couvertureUrl: null,
  pays: null,
  culture: null,
  ageMin: null,
  ageMax: null,
  dureeMinutes: null,
  credits: null,
  fichierTexteUrl: null,
  fichierAudioUrl: null,
  fichierVideoUrl: null,
  ecoleId: null,
  classeId: null,
};

function toConteRequest(conte: ConteDanse): ConteDanseRequest {
  return {
    titre: conte.titre ?? null,
    description: conte.description ?? null,
    thematique: conte.thematique ?? null,
    langueOriginale: conte.langueOriginale ?? null,
    couvertureUrl: conte.couvertureUrl ?? null,
    pays: conte.pays ?? null,
    culture: conte.culture ?? null,
    ageMin: conte.ageMin ?? null,
    ageMax: conte.ageMax ?? null,
    dureeMinutes: conte.dureeMinutes ?? null,
    credits: conte.credits ?? null,
    fichierTexteUrl: conte.fichierTexteUrl ?? null,
    fichierAudioUrl: conte.fichierAudioUrl ?? null,
    fichierVideoUrl: conte.fichierVideoUrl ?? null,
    ecoleId: conte.ecoleId ?? null,
    classeId: conte.classeId ?? null,
  };
}

/** Pays, thème et tranche d'âge (« 6-8 ») sont des champs du conte. */
function withContext(request: ConteDanseRequest, context: ProjectContext): ConteDanseRequest {
  const [ageMin, ageMax] = context.ageRange.split('-').map(Number);
  return { ...request, pays: context.country, thematique: context.theme, ageMin, ageMax };
}

function toDraft(conte: ConteDanse, parcours: ParcoursConte): CreateDancedTaleDraft {
  const ecriture = parcours.ecriture as Pick<TaleWriting, 'texts'> | null;

  return {
    // Le contexte n'existe qu'une fois enregistré : la région est obligatoire.
    context: parcours.region
      ? {
          ageRange: `${conte.ageMin}-${conte.ageMax}` as AgeRange,
          country: conte.pays ?? '',
          region: parcours.region,
          city: parcours.ville ?? '',
          theme: conte.thematique ?? '',
          secretIngredients: parcours.ingredientsSecrets ?? [],
          performanceSpace: parcours.espaceRepresentation,
        }
      : null,
    discovery: parcours.decouverte as TaleDiscovery | null,
    resources: parcours.ressources as TaleResources | null,
    classResources: parcours.ressourcesClasse as TaleClassResources | null,
    universe: parcours.univers as TaleUniverse | null,
    structure: parcours.trame as TaleStructure | null,
    writing: ecriture || conte.titre ? { title: conte.titre ?? '', texts: ecriture?.texts ?? {} } : null,
    staging: parcours.miseEnScene as TaleStaging | null,
  };
}
