import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AdminModuleItem, ConstellationFilm } from '../../core/models/kinox.models';
import { AdminOperationsPanel } from './components/admin-operations-panel/admin-operations-panel';
import { FilmConstellationHero } from './components/film-constellation-hero/film-constellation-hero';
import { InspectorDrawer } from './components/inspector-drawer/inspector-drawer';
import { TopBar } from './components/top-bar/top-bar';
import {
  ACTIVE_GENRES_PREVIEW,
  ADMIN_MODULES,
  CONSTELLATION_FILMS,
  DAILY_SCREENINGS_PREVIEW,
  ROOMS_PREVIEW,
} from './data/home-prototype.data';

@Component({
  selector: 'app-home-page',
  imports: [TopBar, FilmConstellationHero, AdminOperationsPanel, InspectorDrawer],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class HomePage {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  protected readonly films = CONSTELLATION_FILMS;
  protected readonly modules = ADMIN_MODULES;
  protected readonly screenings = DAILY_SCREENINGS_PREVIEW;
  protected readonly rooms = ROOMS_PREVIEW;
  protected readonly genres = ACTIVE_GENRES_PREVIEW;

  protected readonly isIntroReady = signal(false);
  protected readonly isScrolled = signal(false);
  protected readonly selectedModule = signal<AdminModuleItem | null>(null);
  protected readonly selectedFilm = signal<ConstellationFilm | null>(null);

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;
      document.body.style.overflowY = this.isIntroReady() ? '' : 'hidden';
    });

    this.destroyRef.onDestroy(() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflowY = '';
      }
    });
  }

  protected onIntroReadyChange(ready: boolean): void {
    this.isIntroReady.set(ready);
  }

  protected onWindowScroll(): void {
    if (typeof window === 'undefined') return;
    this.isScrolled.set(window.scrollY > 48);
  }

  protected scrollToSection(targetId: string): void {
    if (!this.isIntroReady() || typeof document === 'undefined') return;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  protected onOpenModule(mod: AdminModuleItem): void {
    this.selectedFilm.set(null);
    this.selectedModule.set(mod);
  }

  protected onOpenModuleById(moduleId: string): void {
    const mod = this.modules.find((item) => item.id === moduleId) ?? null;
    this.selectedFilm.set(null);
    this.selectedModule.set(mod);
  }

  protected onOpenFilm(film: ConstellationFilm): void {
    this.selectedModule.set(null);
    this.selectedFilm.set(film);
  }

  protected onCloseDrawer(): void {
    this.selectedModule.set(null);
    this.selectedFilm.set(null);
  }
}
