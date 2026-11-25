import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { normalizeApiError } from '../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../core/models/auth.models';
import { FilmeResponse, GeneroResponse } from '../../../core/models/catalog.models';
import { FilmesService } from '../../../core/services/filmes.service';
import { GenerosService } from '../../../core/services/generos.service';
import { AdminHeader } from '../../../shared/components/admin-header/admin-header';
import { FilmeFormDrawer } from '../components/filme-form-drawer/filme-form-drawer';

@Component({
  selector: 'app-filmes-page',
  imports: [AdminHeader, FilmeFormDrawer, RouterLink],
  templateUrl: './filmes-page.html',
  styleUrl: './filmes-page.css',
})
export class FilmesPage implements OnInit {
  private readonly filmesService = inject(FilmesService);
  private readonly generosService = inject(GenerosService);
  private readonly route = inject(ActivatedRoute);

  protected readonly filmes = signal<readonly FilmeResponse[]>([]);
  protected readonly generos = signal<readonly GeneroResponse[]>([]);

  protected readonly searchQuery = signal('');
  protected readonly selectedGenreId = signal<number | null>(null);

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<ApiErrorInfo | null>(null);
  protected readonly actionError = signal<ApiErrorInfo | null>(null);
  protected readonly feedbackMessage = signal<string | null>(null);

  protected readonly isDrawerOpen = signal(false);
  protected readonly editingFilm = signal<FilmeResponse | null>(null);

  protected readonly confirmingDeleteId = signal<number | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly brokenPosters = signal<ReadonlySet<number>>(new Set());

  protected readonly averageDuration = computed(() => {
    const list = this.filmes();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, film) => acc + (film.duracao || 0), 0);
    return Math.round(sum / list.length);
  });

  protected readonly filteredFilmes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const genreId = this.selectedGenreId();

    return this.filmes().filter((film) => {
      if (genreId !== null && !film.generos.some((g) => g.id === genreId)) {
        return false;
      }
      if (!query) return true;

      const haystack = [
        film.nome,
        film.diretor,
        film.sinopse,
        String(film.id),
        ...film.generos.map((g) => g.nome),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  });

  ngOnInit(): void {
    void this.loadCatalog();
    if (this.route.snapshot.queryParamMap.get('novo') === '1') {
      this.openCreateDrawer();
    }
  }

  protected async loadCatalog(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const [filmes, generos] = await Promise.all([
        this.filmesService.list(),
        this.generosService.list(),
      ]);
      this.filmes.set(filmes);
      this.generos.set(generos);
    } catch (error: unknown) {
      this.loadError.set(normalizeApiError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected selectGenreFilter(genreId: number | null): void {
    this.selectedGenreId.set(genreId);
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.selectedGenreId.set(null);
  }

  protected openCreateDrawer(): void {
    this.actionError.set(null);
    this.editingFilm.set(null);
    this.isDrawerOpen.set(true);
  }

  protected openEditDrawer(film: FilmeResponse): void {
    this.actionError.set(null);
    this.editingFilm.set(film);
    this.isDrawerOpen.set(true);
  }

  protected onCloseDrawer(): void {
    this.isDrawerOpen.set(false);
    this.editingFilm.set(null);
  }

  protected onFilmSaved(savedFilm: FilmeResponse): void {
    const wasEdit = this.editingFilm() !== null;
    this.filmes.update((current) => {
      if (wasEdit) {
        return current.map((item) => (item.id === savedFilm.id ? savedFilm : item));
      }
      return [savedFilm, ...current];
    });
    this.isDrawerOpen.set(false);
    this.editingFilm.set(null);
    this.feedbackMessage.set(
      wasEdit
        ? `Filme "${savedFilm.nome}" atualizado com sucesso.`
        : `Filme "${savedFilm.nome}" cadastrado no catálogo (#${savedFilm.id}).`,
    );
  }

  protected requestDelete(id: number): void {
    this.actionError.set(null);
    this.confirmingDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  protected async confirmDelete(film: FilmeResponse): Promise<void> {
    if (this.deletingId() !== null) return;
    this.deletingId.set(film.id);
    this.actionError.set(null);
    this.feedbackMessage.set(null);

    try {
      await this.filmesService.remove(film.id);
      this.filmes.update((current) => current.filter((item) => item.id !== film.id));
      this.confirmingDeleteId.set(null);
      this.feedbackMessage.set(`Filme "${film.nome}" removido do catálogo.`);
    } catch (error: unknown) {
      this.actionError.set(normalizeApiError(error));
    } finally {
      this.deletingId.set(null);
    }
  }

  protected markPosterBroken(filmId: number): void {
    this.brokenPosters.update((prev) => {
      const next = new Set(prev);
      next.add(filmId);
      return next;
    });
  }

  protected formatAgeRating(rating: number): string {
    return rating <= 0 ? 'L' : `${rating}+`;
  }
}
