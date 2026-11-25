import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { normalizeApiError } from '../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../core/models/auth.models';
import { GeneroResponse } from '../../../core/models/catalog.models';
import { GenerosService } from '../../../core/services/generos.service';
import { AdminHeader } from '../../../shared/components/admin-header/admin-header';

@Component({
  selector: 'app-generos-page',
  imports: [AdminHeader, FormField, RouterLink],
  templateUrl: './generos-page.html',
  styleUrl: './generos-page.css',
})
export class GenerosPage implements OnInit {
  private readonly generosService = inject(GenerosService);

  protected readonly generos = signal<readonly GeneroResponse[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<ApiErrorInfo | null>(null);

  protected readonly isCreating = signal(false);
  protected readonly actionError = signal<ApiErrorInfo | null>(null);
  protected readonly feedbackMessage = signal<string | null>(null);

  protected readonly confirmingDeleteId = signal<number | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  private readonly newGenreModel = signal({ nome: '' });

  protected readonly genreForm = form(this.newGenreModel, (schemaPath) => {
    required(schemaPath.nome, { message: 'Informe o nome do gênero.' });
    minLength(schemaPath.nome, 2, {
      message: 'O nome deve ter pelo menos 2 caracteres.',
    });
  });

  protected readonly nomeError = computed(() => {
    const state = this.genreForm.nome();
    if (!state.touched() || state.valid()) return null;
    return state.errors()[0]?.message ?? 'Nome inválido.';
  });

  protected readonly isDuplicateName = computed(() => {
    const typed = this.newGenreModel().nome.trim().toLowerCase();
    if (!typed) return false;
    return this.generos().some((g) => g.nome.trim().toLowerCase() === typed);
  });

  protected readonly filteredGeneros = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const sorted = [...this.generos()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (!query) return sorted;
    return sorted.filter(
      (g) => g.nome.toLowerCase().includes(query) || String(g.id).includes(query),
    );
  });

  ngOnInit(): void {
    void this.loadGeneros();
  }

  protected async loadGeneros(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);
    try {
      const list = await this.generosService.list();
      this.generos.set(list);
    } catch (error: unknown) {
      this.loadError.set(normalizeApiError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected async onCreateGenre(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isCreating() || this.isDuplicateName()) return;

    this.actionError.set(null);
    this.feedbackMessage.set(null);

    await submit(this.genreForm, async (field) => {
      this.isCreating.set(true);
      try {
        const created = await this.generosService.create(field().value());
        this.generos.update((current) => [...current, created]);
        this.newGenreModel.set({ nome: '' });
        this.genreForm().reset();
        this.feedbackMessage.set(`Gênero "${created.nome}" cadastrado (#${created.id}).`);
      } catch (error: unknown) {
        this.actionError.set(normalizeApiError(error));
      } finally {
        this.isCreating.set(false);
      }
    });
  }

  protected requestDelete(id: number): void {
    this.actionError.set(null);
    this.confirmingDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  protected async confirmDelete(genre: GeneroResponse): Promise<void> {
    if (this.deletingId() !== null) return;
    this.deletingId.set(genre.id);
    this.actionError.set(null);
    this.feedbackMessage.set(null);

    try {
      await this.generosService.remove(genre.id);
      this.generos.update((current) => current.filter((item) => item.id !== genre.id));
      this.confirmingDeleteId.set(null);
      this.feedbackMessage.set(`Gênero "${genre.nome}" removido do catálogo.`);
    } catch (error: unknown) {
      this.actionError.set(normalizeApiError(error));
    } finally {
      this.deletingId.set(null);
    }
  }
}
