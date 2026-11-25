import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormField, form, maxLength, pattern, required, submit } from '@angular/forms/signals';
import { normalizeApiError } from '../../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../../core/models/auth.models';
import {
  FilmeResponse,
  SalaResponse,
  SessaoRequest,
  SessaoResponse,
} from '../../../../core/models/catalog.models';
import { SessoesService, parseSessaoDateTime } from '../../../../core/services/sessoes.service';

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeTimeWithSeconds(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  return trimmed;
}

@Component({
  selector: 'app-sessao-form-drawer',
  imports: [FormField, CurrencyPipe],
  templateUrl: './sessao-form-drawer.html',
  styleUrl: './sessao-form-drawer.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class SessaoFormDrawer {
  private readonly sessoesService = inject(SessoesService);

  readonly isOpen = input(false);
  readonly availableFilmes = input.required<readonly FilmeResponse[]>();
  readonly availableSalas = input.required<readonly SalaResponse[]>();
  readonly isLoadingOptions = input(false);
  readonly optionsError = input<ApiErrorInfo | null>(null);

  readonly closeDrawer = output<void>();
  readonly saved = output<SessaoResponse>();
  readonly retryOptions = output<void>();

  protected readonly selectedFilmeId = signal<number | null>(null);
  protected readonly selectedSalaId = signal<number | null>(null);
  protected readonly isLegendado = signal(true);
  protected readonly disponibilidade = signal(true);
  protected readonly selectionTouched = signal(false);
  protected readonly schedulePastError = signal<string | null>(null);

  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal<ApiErrorInfo | null>(null);

  private readonly sessaoModel = signal({
    data: formatLocalIsoDate(new Date()),
    horarioInicio: '19:30',
  });

  protected readonly sessaoForm = form(this.sessaoModel, (schemaPath) => {
    required(schemaPath.data, { message: 'Informe a data da sessão.' });
    required(schemaPath.horarioInicio, { message: 'Informe o horário de início (24h).' });
    maxLength(schemaPath.horarioInicio, 5, {
      message: 'Use o formato militar 24h entre 00:00 e 23:59 (ex.: 19:30).',
    });
    pattern(schemaPath.horarioInicio, /^([01]\d|2[0-3]):[0-5]\d$/, {
      message: 'Use o formato militar 24h entre 00:00 e 23:59 (ex.: 19:30).',
    });
  });

  protected readonly sortedSalas = computed(() =>
    [...this.availableSalas()].sort((a, b) => a.numero - b.numero),
  );

  protected readonly selectedSala = computed(
    () => this.availableSalas().find((s) => s.id === this.selectedSalaId()) ?? null,
  );

  protected readonly selectedFilme = computed(
    () => this.availableFilmes().find((f) => f.id === this.selectedFilmeId()) ?? null,
  );

  protected readonly filmeError = computed(() => {
    if (!this.selectionTouched()) return null;
    return this.selectedFilmeId() === null ? 'Selecione um filme do catálogo.' : null;
  });

  protected readonly salaError = computed(() => {
    if (!this.selectionTouched()) return null;
    return this.selectedSalaId() === null ? 'Selecione uma sala de projeção.' : null;
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;

      this.apiError.set(null);
      this.selectionTouched.set(false);
      this.schedulePastError.set(null);
      this.isLegendado.set(true);
      this.disponibilidade.set(true);

      this.sessaoModel.set({
        data: formatLocalIsoDate(new Date()),
        horarioInicio: '19:30',
      });
      this.sessaoForm().reset();
    });

    effect(() => {
      if (!this.isOpen()) return;
      const filmes = this.availableFilmes();
      const current = this.selectedFilmeId();
      if (filmes.length > 0 && (current === null || !filmes.some((f) => f.id === current))) {
        this.selectedFilmeId.set(filmes[0].id);
      }
    });

    effect(() => {
      if (!this.isOpen()) return;
      const salas = this.sortedSalas();
      const current = this.selectedSalaId();
      if (salas.length > 0 && (current === null || !salas.some((s) => s.id === current))) {
        const firstActive = salas.find((s) => s.isDisponivel) ?? salas[0];
        this.selectedSalaId.set(firstActive.id);
      }
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

  protected onFilmeChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    this.selectedFilmeId.set(raw ? Number(raw) : null);
    this.selectionTouched.set(true);
  }

  protected onSalaChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    this.selectedSalaId.set(raw ? Number(raw) : null);
    this.selectionTouched.set(true);
  }

  protected setAudioMode(legendado: boolean): void {
    this.isLegendado.set(legendado);
  }

  protected toggleDisponibilidade(): void {
    this.disponibilidade.update((value) => !value);
  }

  protected clearScheduleError(): void {
    this.schedulePastError.set(null);
  }

  protected onMilitaryTimeInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const digits = inputEl.value.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
    if (inputEl.value !== formatted) {
      inputEl.value = formatted;
    }
    this.sessaoModel.update((prev) => ({ ...prev, horarioInicio: formatted }));
    this.schedulePastError.set(null);
  }

  protected fieldError(key: 'data' | 'horarioInicio'): string | null {
    const state = this.sessaoForm[key]();
    if (!state.touched() || state.valid()) return null;
    return state.errors()[0]?.message ?? 'Campo inválido.';
  }

  protected formatSalaNumero(numero: number): string {
    return numero < 10 ? `0${numero}` : String(numero);
  }

  protected formatSalaTech(sala: SalaResponse): string {
    if (sala.isImax && sala.is3d) return 'IMAX · 3D';
    if (sala.isImax) return 'IMAX';
    if (sala.is3d) return '3D';
    return '2D';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting()) return;

    this.selectionTouched.set(true);
    this.schedulePastError.set(null);
    this.apiError.set(null);

    await submit(this.sessaoForm, async (field) => {
      const filmeId = this.selectedFilmeId();
      const salaId = this.selectedSalaId();
      if (filmeId === null || salaId === null) return;

      const val = field().value();
      const horarioNormalized = normalizeTimeWithSeconds(val.horarioInicio);
      const scheduledStart = parseSessaoDateTime(val.data, horarioNormalized);

      if (!scheduledStart || scheduledStart.getTime() < Date.now()) {
        this.schedulePastError.set(
          'Escolha uma data e horário futuros para que a sessão entre na grade ativa.',
        );
        return;
      }

      this.isSubmitting.set(true);
      const payload: SessaoRequest = {
        filmeId,
        salaId,
        disponibilidade: this.disponibilidade(),
        data: val.data,
        horarioInicio: horarioNormalized,
        isLegendado: this.isLegendado(),
      };

      try {
        const created = await this.sessoesService.create(payload);
        this.saved.emit(created);
      } catch (error: unknown) {
        this.apiError.set(normalizeApiError(error));
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }
}
