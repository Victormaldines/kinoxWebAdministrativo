import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormField, form, min, minLength, required, submit } from '@angular/forms/signals';
import { normalizeApiError } from '../../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../../core/models/auth.models';
import { FilmeRequest, FilmeResponse, GeneroResponse } from '../../../../core/models/catalog.models';
import { FilmesService } from '../../../../core/services/filmes.service';

@Component({
  selector: 'app-filme-form-drawer',
  imports: [FormField],
  templateUrl: './filme-form-drawer.html',
  styleUrl: './filme-form-drawer.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class FilmeFormDrawer {
  private readonly filmesService = inject(FilmesService);

  readonly isOpen = input(false);
  readonly editingFilm = input<FilmeResponse | null>(null);
  readonly availableGenres = input.required<readonly GeneroResponse[]>();

  readonly closeDrawer = output<void>();
  readonly saved = output<FilmeResponse>();

  protected readonly selectedGenreIds = signal<readonly number[]>([]);
  protected readonly genresTouched = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal<ApiErrorInfo | null>(null);
  protected readonly previewBroken = signal(false);

  private readonly filmModel = signal({
    nome: '',
    diretor: '',
    duracao: 120,
    classificacaoIndicativa: 12,
    imagemUrl: '',
    sinopse: '',
  });

  protected readonly filmForm = form(this.filmModel, (schemaPath) => {
    required(schemaPath.nome, { message: 'Informe o título do filme.' });
    minLength(schemaPath.nome, 2, { message: 'O título deve ter pelo menos 2 caracteres.' });
    required(schemaPath.diretor, { message: 'Informe o nome do diretor.' });
    minLength(schemaPath.diretor, 2, { message: 'O diretor deve ter pelo menos 2 caracteres.' });
    min(schemaPath.duracao, 1, { message: 'Informe uma duração válida em minutos.' });
    min(schemaPath.classificacaoIndicativa, 0, { message: 'Classificação inválida.' });
    required(schemaPath.imagemUrl, { message: 'Informe a URL da imagem/pôster.' });
    required(schemaPath.sinopse, { message: 'Informe a sinopse do filme.' });
    minLength(schemaPath.sinopse, 10, {
      message: 'A sinopse deve conter ao menos 10 caracteres.',
    });
  });

  protected readonly isEditMode = computed(() => this.editingFilm() !== null);
  protected readonly previewUrl = computed(() => this.filmModel().imagemUrl.trim());

  private readonly baseAgeOptions: readonly { value: number; label: string }[] = [
    { value: 0, label: 'Livre (0)' },
    { value: 10, label: '10 anos' },
    { value: 12, label: '12 anos' },
    { value: 14, label: '14 anos' },
    { value: 16, label: '16 anos' },
    { value: 18, label: '18 anos' },
  ];

  protected readonly ageOptions = computed(() => {
    const current = Number(this.filmModel().classificacaoIndicativa);
    if (
      Number.isNaN(current) ||
      this.baseAgeOptions.some((opt) => opt.value === current)
    ) {
      return this.baseAgeOptions;
    }
    return [
      ...this.baseAgeOptions,
      { value: current, label: current <= 0 ? 'Livre (0)' : `${current} anos` },
    ].sort((a, b) => a.value - b.value);
  });

  protected readonly genresError = computed(() => {
    if (!this.genresTouched()) return null;
    return this.selectedGenreIds().length === 0 ? 'Selecione ao menos um gênero.' : null;
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const film = this.editingFilm();
      if (!open) return;

      this.apiError.set(null);
      this.previewBroken.set(false);
      this.genresTouched.set(false);

      if (film) {
        this.filmModel.set({
          nome: film.nome,
          diretor: film.diretor,
          duracao: Number(film.duracao),
          classificacaoIndicativa: Number(film.classificacaoIndicativa),
          imagemUrl: film.imagemUrl,
          sinopse: film.sinopse,
        });
        this.selectedGenreIds.set(film.generos.map((g) => g.id));
      } else {
        this.filmModel.set({
          nome: '',
          diretor: '',
          duracao: 120,
          classificacaoIndicativa: 12,
          imagemUrl: '',
          sinopse: '',
        });
        this.selectedGenreIds.set([]);
      }
      this.filmForm().reset();
    });
  }

  protected onEscape(): void {
    if (this.isOpen() && !this.isSubmitting()) {
      this.closeDrawer.emit();
    }
  }

  protected onClose(): void {
    if (!this.isSubmitting()) {
      this.closeDrawer.emit();
    }
  }

  protected isGenreSelected(genreId: number): boolean {
    return this.selectedGenreIds().includes(genreId);
  }

  protected toggleGenre(genreId: number): void {
    this.genresTouched.set(true);
    this.selectedGenreIds.update((current) =>
      current.includes(genreId) ? current.filter((id) => id !== genreId) : [...current, genreId],
    );
  }

  protected onAgeSelectChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.filmModel.update((prev) => ({ ...prev, classificacaoIndicativa: value }));
  }

  protected onPreviewUrlInput(): void {
    this.previewBroken.set(false);
  }

  protected onPreviewError(): void {
    this.previewBroken.set(true);
  }

  protected fieldError(
    key: 'nome' | 'diretor' | 'duracao' | 'imagemUrl' | 'sinopse',
  ): string | null {
    const state = this.filmForm[key]();
    if (!state.touched() || state.valid()) return null;
    return state.errors()[0]?.message ?? 'Campo inválido.';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting()) return;

    this.genresTouched.set(true);
    this.apiError.set(null);

    await submit(this.filmForm, async (field) => {
      if (this.selectedGenreIds().length === 0) return;

      this.isSubmitting.set(true);
      const val = field().value();
      const payload: FilmeRequest = {
        nome: val.nome,
        diretor: val.diretor,
        duracao: Number(val.duracao),
        classificacaoIndicativa: Number(val.classificacaoIndicativa),
        imagemUrl: val.imagemUrl,
        sinopse: val.sinopse,
        generosId: this.selectedGenreIds(),
      };

      try {
        const current = this.editingFilm();
        const result = current
          ? await this.filmesService.update(current.id, payload)
          : await this.filmesService.create(payload);
        this.saved.emit(result);
      } catch (error: unknown) {
        this.apiError.set(normalizeApiError(error));
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }
}
