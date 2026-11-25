import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  AdminModuleItem,
  ConstellationFilm,
  DailyScreeningPreview,
  ModuleCategory,
  RoomStatusPreview,
} from '../../../../core/models/kinox.models';

interface CategoryFilterOption {
  readonly id: ModuleCategory;
  readonly label: string;
}

@Component({
  selector: 'app-admin-operations-panel',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './admin-operations-panel.html',
  styleUrl: './admin-operations-panel.css',
})
export class AdminOperationsPanel {
  protected readonly auth = inject(AuthService);
  readonly modules = input.required<readonly AdminModuleItem[]>();
  readonly films = input.required<readonly ConstellationFilm[]>();
  readonly screenings = input.required<readonly DailyScreeningPreview[]>();
  readonly rooms = input.required<readonly RoomStatusPreview[]>();
  readonly genres = input.required<readonly string[]>();

  readonly openModule = output<AdminModuleItem>();
  readonly openFilm = output<ConstellationFilm>();

  protected readonly searchQuery = signal('');
  protected readonly activeCategory = signal<ModuleCategory>('todos');

  protected readonly visibleModules = computed(() => {
    const all = this.modules();
    if (this.auth.isAuthenticated()) return all;
    return all.filter(
      (mod) => mod.category !== 'bilheteria' && mod.category !== 'governanca',
    );
  });

  protected readonly categories = computed<readonly CategoryFilterOption[]>(() => {
    const count = this.visibleModules().length;
    const base: CategoryFilterOption[] = [
      { id: 'todos', label: `Todos (${count})` },
      { id: 'programacao', label: 'Programação' },
      { id: 'infraestrutura', label: 'Infraestrutura' },
    ];
    if (this.auth.isAuthenticated()) {
      base.push(
        { id: 'bilheteria', label: 'Bilheteria' },
        { id: 'governanca', label: 'Governança' },
      );
    }
    return base;
  });

  protected readonly filteredModules = computed(() => {
    const category = this.activeCategory();
    const validCategories = this.categories().map((c) => c.id);
    const effectiveCategory = validCategories.includes(category) ? category : 'todos';
    const query = this.searchQuery().trim().toLowerCase();

    return this.visibleModules().filter((mod) => {
      const matchesCategory = effectiveCategory === 'todos' || mod.category === effectiveCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [
        mod.title,
        mod.subtitle,
        mod.primaryRoute,
        mod.code,
        mod.categoryLabel,
        ...mod.endpoints.map((ep) => `${ep.method} ${ep.path} ${ep.summary}`),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  });

  protected readonly programmingModules = computed(() =>
    this.filteredModules().filter((m) => m.category === 'programacao'),
  );

  protected readonly infrastructureModules = computed(() =>
    this.filteredModules().filter((m) => m.category === 'infraestrutura'),
  );

  protected readonly governanceAndTicketingModules = computed(() =>
    this.filteredModules().filter(
      (m) => m.category === 'bilheteria' || m.category === 'governanca',
    ),
  );

  protected readonly featuredFilms = computed(() => this.films().slice(0, 5));

  protected uniqueVerbs(mod: AdminModuleItem): readonly string[] {
    return [...new Set(mod.endpoints.map((ep) => ep.method))];
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.activeCategory.set('todos');
  }

  protected selectCategory(category: ModuleCategory): void {
    this.activeCategory.set(category);
  }

  protected occupancyPercent(screening: DailyScreeningPreview): number {
    return Math.round((screening.occupiedSeats / screening.totalSeats) * 100);
  }

  protected onOpenModule(mod: AdminModuleItem): void {
    this.openModule.emit(mod);
  }

  protected onOpenModuleById(moduleId: string): void {
    const found = this.modules().find((m) => m.id === moduleId);
    if (found) {
      this.openModule.emit(found);
    }
  }

  protected onOpenFilm(film: ConstellationFilm): void {
    this.openFilm.emit(film);
  }
}
