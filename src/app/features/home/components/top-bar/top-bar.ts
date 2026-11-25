import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  protected readonly auth = inject(AuthService);

  readonly isScrolled = input(false);
  readonly isVisible = input(true);
  readonly navigateToSection = output<string>();

  protected onNavigate(targetId: string, event: Event): void {
    event.preventDefault();
    this.navigateToSection.emit(targetId);
  }

  protected onLogout(): void {
    this.auth.logout('manual');
  }
}
