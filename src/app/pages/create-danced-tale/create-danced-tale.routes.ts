import { Routes } from '@angular/router';
import { CreateDancedTaleComponent } from './create-danced-tale.component';
import { ProjectContextComponent } from './context/project-context.component';
import { StepComingSoonComponent } from './coming-soon/step-coming-soon.component';
import { TaleDiscoveryComponent } from './discovery/tale-discovery.component';
import { TaleResourcesComponent } from './resources/tale-resources.component';
import { TaleStagingComponent } from './staging/tale-staging.component';
import { TaleStructureComponent } from './structure/tale-structure.component';
import { TaleUniverseComponent } from './universe/tale-universe.component';
import { TaleWritingComponent } from './writing/tale-writing.component';
import { requireProjectContext, requireTaleStructure } from './create-danced-tale.guards';

export const CREATE_DANCED_TALE_ROUTES: Routes = [
  {
    path: '',
    component: CreateDancedTaleComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'context' },
      { path: 'context', component: ProjectContextComponent },
      { path: 'discovery', component: TaleDiscoveryComponent, canActivate: [requireProjectContext] },
      { path: 'resources', component: TaleResourcesComponent, canActivate: [requireProjectContext] },
      // Écran 4 pas encore développé : on peut passer directement à l'univers du conte.
      {
        path: 'class-resources',
        component: StepComingSoonComponent,
        data: { previousStep: 'resources', nextStep: 'universe' },
      },
      { path: 'universe', component: TaleUniverseComponent, canActivate: [requireProjectContext] },
      { path: 'structure', component: TaleStructureComponent, canActivate: [requireProjectContext] },
      { path: 'writing', component: TaleWritingComponent, canActivate: [requireTaleStructure] },
      { path: 'staging', component: TaleStagingComponent, canActivate: [requireTaleStructure] },
    ],
  },
];
