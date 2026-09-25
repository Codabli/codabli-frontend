import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactForm } from './contact.form';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '../../shared/components/button/button.component';

@Component({
  imports: [ReactiveFormsModule, TranslatePipe, Button],
  selector: 'app-contact',
  styleUrl: './contact.component.scss',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  contactForm = new ContactForm();

  onSubmit(): void {
    if (this.contactForm.invalid) {
      return;
    }

    const contact = this.contactForm.getRawValue();

    console.log(contact);
  }
  resetForm(): void {
    this.contactForm.reset();
  }
}
