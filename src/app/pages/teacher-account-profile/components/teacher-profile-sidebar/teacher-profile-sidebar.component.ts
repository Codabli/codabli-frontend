import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  selector: 'app-teacher-profile-sidebar',
  styleUrl: './teacher-profile-sidebar.component.scss',
  templateUrl: './teacher-profile-sidebar.component.html',
})
export class TeacherProfileSidebarComponent {}
