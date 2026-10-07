import { Routes } from '@angular/router';
import { CreateDancedTaleComponent } from './create-danced-tale.component';
import { ProjectContextComponent } from './context/project-context.component';
import { StepComingSoonComponent } from './coming-soon/step-coming-soon.component';

export const CREATE_DANCED_TALE_ROUTES: Routes = [
  {
    path: '',
    component: CreateDancedTaleComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'context' },
      { path: 'context', component: ProjectContextComponent },
      { path: 'discovery', component: StepComingSoonComponent },
    ],
  },
];
