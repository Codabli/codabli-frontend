import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { CreateDancedTaleDraftService } from '../../core/services/create-danced-tale-draft.service';

/** Chemin d'un écran frère de `route` dans le parcours (ex. `/create-danced-tale/context`). */
function siblingPath(route: ActivatedRouteSnapshot, path: string): string[] {
  const parentSegments = route.parent?.pathFromRoot.flatMap((r) => r.url.map((s) => s.path)) ?? [];
  return ['/', ...parentSegments, path];
}

/** Les écrans suivants s'appuient sur le contexte du projet (écran 1) : sans lui, on y renvoie. */
export const requireProjectContext: CanActivateFn = (route) => {
  if (inject(CreateDancedTaleDraftService).context()) {
    return true;
  }

  return inject(Router).createUrlTree(siblingPath(route, 'context'));
};

/** L'écriture (écran 7) suit les étapes de la trame (écran 6) : sans trame, on y renvoie. */
export const requireTaleStructure: CanActivateFn = (route) => {
  const draft = inject(CreateDancedTaleDraftService);

  if (!draft.context()) {
    return inject(Router).createUrlTree(siblingPath(route, 'context'));
  }

  if (draft.structure()?.steps.length) {
    return true;
  }

  return inject(Router).createUrlTree(siblingPath(route, 'structure'));
};
