import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DISPLAY_KINOX_API_HOST } from '../../../core/config/api.config';

@Component({
  selector: 'app-admin-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css',
})
export class AdminHeader {
  protected readonly auth = inject(AuthService);
  protected readonly apiHost = DISPLAY_KINOX_API_HOST;

  readonly resourcePath = input.required<string>();

  protected onLogout(): void {
    this.auth.logout('manual');
  }
}
