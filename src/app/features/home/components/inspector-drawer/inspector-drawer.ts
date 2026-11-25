import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminModuleItem, ConstellationFilm } from '../../../../core/models/kinox.models';

@Component({
  selector: 'app-inspector-drawer',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './inspector-drawer.html',
  styleUrl: './inspector-drawer.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class InspectorDrawer {
  protected readonly auth = inject(AuthService);
  readonly selectedModule = input<AdminModuleItem | null>(null);
  readonly selectedFilm = input<ConstellationFilm | null>(null);

  readonly closeDrawer = output<void>();
  readonly inspectModuleById = output<string>();

  protected onEscape(): void {
    if (this.selectedModule() || this.selectedFilm()) {
      this.closeDrawer.emit();
    }
  }

  protected onClose(): void {
    this.closeDrawer.emit();
  }

  protected onGoToFilmsModule(): void {
    this.inspectModuleById.emit('filmes');
  }
}
