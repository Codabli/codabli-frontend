import { Component } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';

interface Invoice {
  id: string;
  date: string;
  amount: string;
}


@Component({
  imports: [ButtonComponent],
  selector: 'app-teacher-subscription',
  styleUrl: './teacher-subscription.component.scss',
  templateUrl: './teacher-subscription.component.html',
})
export class TeacherSubscriptionComponent {
    // Données fictives pour reproduire le wireframe.
  // À remplacer par les données du backend.
  protected readonly invoices: Invoice[] = [
    { id: '1', date: '03/02/2026', amount: '3 €' },
    { id: '2', date: '03/01/2026', amount: '3 €' },
    { id: '3', date: '03/12/2025', amount: '3 €' },
  ];
}
