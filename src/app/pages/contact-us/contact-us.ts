import { Component } from '@angular/core';

type ContactForm = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.html',
    styleUrl: './contact-us.scss',
})

export class ContactUs {
    contact: ContactForm = {
        name: '',
        email: '',
        subject: '',
        message: '',
    };

    onSubmit(): void {
        if (!this.contact.name || !this.contact.email || !this.contact.subject || !this.contact.message) {
            return;
        }

        console.log('Formulaire de contact soumis :', this.contact);

        this.resetForm();
    }

    resetForm(): void {
        this.contact = {
            name: '',
            email: '',
            subject: '',
            message: '',
        };
    }
}