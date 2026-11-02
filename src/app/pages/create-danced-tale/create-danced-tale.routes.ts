import { Routes } from '@angular/router';
import { CreateDancedTaleComponent } from './create-danced-tale.component';
import { ProjectContextComponent } from './context/project-context.component';
import { TaleClassResourcesComponent } from './class-resources/tale-class-resources.component';
import { TaleDiscoveryComponent } from './discovery/tale-discovery.component';
import { TaleResourcesComponent } from './resources/tale-resources.component';
import { TaleStagingComponent } from './staging/tale-staging.component';
import { TaleStructureComponent } from './structure/tale-structure.component';
import { TaleUniverseComponent } from './universe/tale-universe.component';
import { TaleWritingComponent } from './writing/tale-writing.component';
import { loadTale, requireProjectContext, requireTaleStructure, startNewTale } from './create-danced-tale.guards';

export const CREATE_DANCED_TALE_ROUTES: Routes = [
  {
    path: '',
    component: CreateDancedTaleComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'context' },
      // Nouveau conte : il est créé au passage de l'écran 1, puis on continue sous son identifiant.
      { path: 'context', component: ProjectContextComponent, canActivate: [startNewTale] },
      {
        path: ':taleId',
        canActivate: [loadTale],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'context' },
          { path: 'context', component: ProjectContextComponent },
          { path: 'discovery', component: TaleDiscoveryComponent, canActivate: [requireProjectContext] },
          { path: 'resources', component: TaleResourcesComponent, canActivate: [requireProjectContext] },
          { path: 'class-resources', component: TaleClassResourcesComponent, canActivate: [requireProjectContext] },
          { path: 'universe', component: TaleUniverseComponent, canActivate: [requireProjectContext] },
          { path: 'structure', component: TaleStructureComponent, canActivate: [requireProjectContext] },
          { path: 'writing', component: TaleWritingComponent, canActivate: [requireTaleStructure] },
          { path: 'staging', component: TaleStagingComponent, canActivate: [requireTaleStructure] },
        ],
      },
    ],
  },
];
