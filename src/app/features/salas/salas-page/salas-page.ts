import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { normalizeApiError } from '../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../core/models/auth.models';
import { SalaResponse } from '../../../core/models/catalog.models';
import { SalasService } from '../../../core/services/salas.service';
import { AdminHeader } from '../../../shared/components/admin-header/admin-header';
import { SalaFormDrawer } from '../components/sala-form-drawer/sala-form-drawer';

type SalaFilter = 'todas' | 'ativas' | 'manutencao' | 'imax' | '3d';

@Component({
  selector: 'app-salas-page',
  imports: [AdminHeader, CurrencyPipe, SalaFormDrawer],
  templateUrl: './salas-page.html',
  styleUrl: './salas-page.css',
})
export class SalasPage implements OnInit {
  private readonly salasService = inject(SalasService);

  protected readonly salas = signal<readonly SalaResponse[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<SalaFilter>('todas');

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<ApiErrorInfo | null>(null);
  protected readonly actionError = signal<ApiErrorInfo | null>(null);
  protected readonly feedbackMessage = signal<string | null>(null);

  protected readonly isDrawerOpen = signal(false);
  protected readonly editingSala = signal<SalaResponse | null>(null);
  protected readonly togglingSalaId = signal<number | null>(null);

  protected readonly filters: readonly { id: SalaFilter; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'ativas', label: 'Ativas' },
    { id: 'manutencao', label: 'Manutenção' },
    { id: 'imax', label: 'IMAX' },
    { id: '3d', label: '3D' },
  ];

  protected readonly nextSalaNumero = computed(() => {
    const list = this.salas();
    if (list.length === 0) return 1;
    return Math.max(...list.map((s) => s.numero)) + 1;
  });

  protected readonly activeCount = computed(
    () => this.salas().filter((sala) => sala.isDisponivel).length,
  );

  protected readonly totalCapacity = computed(() =>
    this.salas().reduce((sum, sala) => sum + (sala.qtdAssentos || 0), 0),
  );

  protected readonly averageTicketPrice = computed(() => {
    const list = this.salas();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, sala) => acc + (sala.precoDoIngresso || 0), 0);
    return sum / list.length;
  });

  protected readonly filteredSalas = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.activeFilter();

    return [...this.salas()]
      .sort((a, b) => a.numero - b.numero)
      .filter((sala) => {
        if (filter === 'ativas' && !sala.isDisponivel) return false;
        if (filter === 'manutencao' && sala.isDisponivel) return false;
        if (filter === 'imax' && !sala.isImax) return false;
        if (filter === '3d' && !sala.is3d) return false;
        if (!query) return true;

        const haystack = [
          `sala ${sala.numero}`,
          `sala 0${sala.numero}`,
          String(sala.id),
          sala.isImax ? 'imax' : '',
          sala.is3d ? '3d' : '',
          !sala.isImax && !sala.is3d ? '2d' : '',
          sala.isDisponivel ? 'ativa disponivel' : 'manutencao offline',
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      });
  });

  ngOnInit(): void {
    void this.loadSalas();
  }

  protected async loadSalas(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const list = await this.salasService.list();
      this.salas.set(list);
    } catch (error: unknown) {
      this.loadError.set(normalizeApiError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected selectFilter(filter: SalaFilter): void {
    this.activeFilter.set(filter);
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.activeFilter.set('todas');
  }

  protected openCreateDrawer(): void {
    this.actionError.set(null);
    this.editingSala.set(null);
    this.isDrawerOpen.set(true);
  }

  protected openEditDrawer(sala: SalaResponse): void {
    this.actionError.set(null);
    this.editingSala.set(sala);
    this.isDrawerOpen.set(true);
  }

  protected onCloseDrawer(): void {
    this.isDrawerOpen.set(false);
    this.editingSala.set(null);
  }

  protected onSalaSaved(saved: SalaResponse): void {
    const wasEdit = this.editingSala() !== null;
    this.salas.update((current) => {
      if (wasEdit) {
        return current.map((item) => (item.id === saved.id ? saved : item));
      }
      return [...current, saved];
    });
    this.isDrawerOpen.set(false);
    this.editingSala.set(null);
    this.feedbackMessage.set(
      wasEdit
        ? `Sala ${this.formatSalaNumero(saved.numero)} atualizada com sucesso.`
        : `Sala ${this.formatSalaNumero(saved.numero)} cadastrada com ${saved.qtdAssentos} assentos gerados.`,
    );
  }

  protected async toggleDisponibilidade(sala: SalaResponse): Promise<void> {
    if (this.togglingSalaId() !== null) return;
    this.togglingSalaId.set(sala.id);
    this.actionError.set(null);
    this.feedbackMessage.set(null);

    try {
      const updated = await this.salasService.update(sala.id, {
        numero: sala.numero,
        precoDoIngresso: sala.precoDoIngresso,
        qtdAssentos: sala.qtdAssentos,
        is3d: sala.is3d,
        isImax: sala.isImax,
        isDisponivel: !sala.isDisponivel,
      });
      this.salas.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      this.feedbackMessage.set(
        `Sala ${this.formatSalaNumero(updated.numero)} marcada como ${updated.isDisponivel ? 'ATIVA' : 'MANUTENÇÃO'}.`,
      );
    } catch (error: unknown) {
      this.actionError.set(normalizeApiError(error));
    } finally {
      this.togglingSalaId.set(null);
    }
  }

  protected formatSalaNumero(numero: number): string {
    return numero < 10 ? `0${numero}` : String(numero);
  }
}
