import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormField, form, min, submit } from '@angular/forms/signals';
import { normalizeApiError } from '../../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../../core/models/auth.models';
import { SalaRequest, SalaResponse } from '../../../../core/models/catalog.models';
import { SalasService } from '../../../../core/services/salas.service';

@Component({
  selector: 'app-sala-form-drawer',
  imports: [FormField],
  templateUrl: './sala-form-drawer.html',
  styleUrl: './sala-form-drawer.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class SalaFormDrawer {
  private readonly salasService = inject(SalasService);

  readonly isOpen = input(false);
  readonly editingSala = input<SalaResponse | null>(null);
  readonly suggestedNumero = input(1);

  readonly closeDrawer = output<void>();
  readonly saved = output<SalaResponse>();

  protected readonly is3d = signal(false);
  protected readonly isImax = signal(false);
  protected readonly isDisponivel = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal<ApiErrorInfo | null>(null);

  private readonly salaModel = signal({
    numero: 1,
    precoDoIngresso: 36,
    qtdAssentos: 80,
  });

  protected readonly salaForm = form(this.salaModel, (schemaPath) => {
    min(schemaPath.numero, 1, { message: 'Informe um número de sala válido (≥ 1).' });
    min(schemaPath.precoDoIngresso, 1, { message: 'Informe um preço válido (≥ R$ 1,00).' });
    min(schemaPath.qtdAssentos, 1, { message: 'Informe pelo menos 1 assento.' });
  });

  protected readonly isEditMode = computed(() => this.editingSala() !== null);

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const sala = this.editingSala();
      if (!open) return;

      this.apiError.set(null);

      if (sala) {
        this.salaModel.set({
          numero: sala.numero,
          precoDoIngresso: sala.precoDoIngresso,
          qtdAssentos: sala.qtdAssentos,
        });
        this.is3d.set(sala.is3d);
        this.isImax.set(sala.isImax);
        this.isDisponivel.set(sala.isDisponivel);
      } else {
        this.salaModel.set({
          numero: this.suggestedNumero(),
          precoDoIngresso: 36,
          qtdAssentos: 80,
        });
        this.is3d.set(false);
        this.isImax.set(false);
        this.isDisponivel.set(true);
      }
      this.salaForm().reset();
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

  protected toggleFlag(flag: 'is3d' | 'isImax' | 'isDisponivel'): void {
    this[flag].update((value) => !value);
  }

  protected fieldError(key: 'numero' | 'precoDoIngresso' | 'qtdAssentos'): string | null {
    const state = this.salaForm[key]();
    if (!state.touched() || state.valid()) return null;
    return state.errors()[0]?.message ?? 'Valor inválido.';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting()) return;

    this.apiError.set(null);

    await submit(this.salaForm, async (field) => {
      this.isSubmitting.set(true);
      const val = field().value();
      const payload: SalaRequest = {
        numero: Number(val.numero),
        precoDoIngresso: Number(val.precoDoIngresso),
        qtdAssentos: Number(val.qtdAssentos),
        is3d: this.is3d(),
        isImax: this.isImax(),
        isDisponivel: this.isDisponivel(),
      };

      try {
        const current = this.editingSala();
        const result = current
          ? await this.salasService.update(current.id, payload)
          : await this.salasService.create(payload);
        this.saved.emit(result);
      } catch (error: unknown) {
        this.apiError.set(normalizeApiError(error));
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }
}
