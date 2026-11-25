import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { normalizeApiError } from '../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../core/models/auth.models';
import { FilmeResponse, SalaResponse, SessaoResponse } from '../../../core/models/catalog.models';
import { FilmesService } from '../../../core/services/filmes.service';
import { SalasService } from '../../../core/services/salas.service';
import {
  SessoesService,
  isUpcomingSessao,
  parseSessaoDateTime,
} from '../../../core/services/sessoes.service';
import { AdminHeader } from '../../../shared/components/admin-header/admin-header';
import { SeatMapModal } from '../components/seat-map-modal/seat-map-modal';
import { SessaoFormDrawer } from '../components/sessao-form-drawer/sessao-form-drawer';

type SessaoFilter = 'todas' | 'legendado' | 'dublado' | 'imax' | '3d';

@Component({
  selector: 'app-sessoes-page',
  imports: [AdminHeader, CurrencyPipe, SeatMapModal, SessaoFormDrawer],
  templateUrl: './sessoes-page.html',
  styleUrl: './sessoes-page.css',
})
export class SessoesPage implements OnInit {
  private readonly sessoesService = inject(SessoesService);
  private readonly filmesService = inject(FilmesService);
  private readonly salasService = inject(SalasService);
  protected readonly auth = inject(AuthService);

  protected readonly allSessoes = signal<readonly SessaoResponse[]>([]);
  protected readonly availableFilmes = signal<readonly FilmeResponse[]>([]);
  protected readonly availableSalas = signal<readonly SalaResponse[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<SessaoFilter>('todas');

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<ApiErrorInfo | null>(null);
  protected readonly selectedSessao = signal<SessaoResponse | null>(null);

  protected readonly isCreateDrawerOpen = signal(false);
  protected readonly isLoadingDrawerOptions = signal(false);
  protected readonly drawerOptionsError = signal<ApiErrorInfo | null>(null);
  protected readonly feedbackMessage = signal<string | null>(null);

  protected readonly filters: readonly { id: SessaoFilter; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'legendado', label: 'Legendado' },
    { id: 'dublado', label: 'Dublado' },
    { id: 'imax', label: 'IMAX' },
    { id: '3d', label: '3D' },
  ];

  protected readonly upcomingSessoes = computed(() => {
    const now = new Date();
    return this.allSessoes()
      .filter((sessao) => isUpcomingSessao(sessao, now))
      .sort((a, b) => {
        const da = parseSessaoDateTime(a.data, a.horarioInicio)?.getTime() ?? 0;
        const db = parseSessaoDateTime(b.data, b.horarioInicio)?.getTime() ?? 0;
        return da - db;
      });
  });

  protected readonly filteredSessoes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.activeFilter();

    return this.upcomingSessoes().filter((sessao) => {
      if (filter === 'legendado' && !sessao.isLegendado) return false;
      if (filter === 'dublado' && sessao.isLegendado) return false;
      if (filter === 'imax' && !sessao.sala?.isImax) return false;
      if (filter === '3d' && !sessao.sala?.is3d) return false;
      if (!query) return true;

      const haystack = [
        sessao.filme?.nome ?? '',
        sessao.filme?.diretor ?? '',
        `sala ${sessao.sala?.numero ?? ''}`,
        `sala 0${sessao.sala?.numero ?? ''}`,
        this.formatDate(sessao.data),
        this.formatTime(sessao.horarioInicio),
        sessao.isLegendado ? 'leg legendado' : 'dub dublado',
        sessao.sala?.isImax ? 'imax' : '',
        sessao.sala?.is3d ? '3d' : '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  });

  protected readonly totalOccupiedSeats = computed(() =>
    this.upcomingSessoes().reduce((sum, s) => sum + this.occupiedCount(s), 0),
  );

  protected readonly totalSeatInventory = computed(() =>
    this.upcomingSessoes().reduce((sum, s) => sum + this.totalCount(s), 0),
  );

  protected readonly averageOccupancy = computed(() => {
    const total = this.totalSeatInventory();
    return total > 0 ? Math.round((this.totalOccupiedSeats() / total) * 100) : 0;
  });

  protected readonly distinctRoomsCount = computed(() => {
    const roomIds = new Set(this.upcomingSessoes().map((s) => s.sala?.id).filter(Boolean));
    return roomIds.size;
  });

  ngOnInit(): void {
    void this.loadSessoes();
  }

  protected async loadSessoes(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const list = await this.sessoesService.list();
      this.allSessoes.set(list);
    } catch (error: unknown) {
      this.loadError.set(normalizeApiError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected selectFilter(filter: SessaoFilter): void {
    this.activeFilter.set(filter);
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.activeFilter.set('todas');
  }

  protected openSeatMap(sessao: SessaoResponse): void {
    this.selectedSessao.set(sessao);
  }

  protected closeSeatMap(): void {
    this.selectedSessao.set(null);
  }

  protected openCreateDrawer(): void {
    if (!this.auth.isAuthenticated()) return;
    this.isCreateDrawerOpen.set(true);
    void this.loadDrawerOptions();
  }

  protected closeCreateDrawer(): void {
    this.isCreateDrawerOpen.set(false);
  }

  protected async loadDrawerOptions(): Promise<void> {
    this.isLoadingDrawerOptions.set(true);
    this.drawerOptionsError.set(null);

    try {
      const [filmes, salas] = await Promise.all([
        this.filmesService.list(),
        this.salasService.list(),
      ]);
      this.availableFilmes.set(filmes);
      this.availableSalas.set(salas);
    } catch (error: unknown) {
      this.drawerOptionsError.set(normalizeApiError(error));
    } finally {
      this.isLoadingDrawerOptions.set(false);
    }
  }

  protected onSessaoSaved(created: SessaoResponse): void {
    this.allSessoes.update((list) => [created, ...list.filter((s) => s.id !== created.id)]);
    this.isCreateDrawerOpen.set(false);
    this.showFeedback(
      `Sessão #${created.id} ("${created.filme.nome}" · ${this.formatDate(created.data)} às ${this.formatTime(created.horarioInicio)}) cadastrada com sucesso.`,
    );
  }

  private showFeedback(message: string): void {
    this.feedbackMessage.set(message);
    setTimeout(() => {
      if (this.feedbackMessage() === message) {
        this.feedbackMessage.set(null);
      }
    }, 4500);
  }

  protected occupiedCount(sessao: SessaoResponse): number {
    return (sessao.sessaoAssentos ?? []).filter((a) => a.isOcupado).length;
  }

  protected totalCount(sessao: SessaoResponse): number {
    const seatsLen = sessao.sessaoAssentos?.length ?? 0;
    return seatsLen > 0 ? seatsLen : (sessao.sala?.qtdAssentos ?? 0);
  }

  protected occupancyPercent(sessao: SessaoResponse): number {
    const total = this.totalCount(sessao);
    return total > 0 ? Math.round((this.occupiedCount(sessao) / total) * 100) : 0;
  }

  protected isFull(sessao: SessaoResponse): boolean {
    const total = this.totalCount(sessao);
    return !sessao.disponibilidade || (total > 0 && this.occupiedCount(sessao) >= total);
  }

  protected formatDate(isoDate: string): string {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  protected formatTime(time: string): string {
    return time ? time.slice(0, 5) : '--:--';
  }

  protected formatSalaNumero(numero: number): string {
    return numero < 10 ? `0${numero}` : String(numero);
  }

  protected formatFormatLabel(sessao: SessaoResponse): string {
    if (sessao.sala?.isImax) return 'IMAX';
    if (sessao.sala?.is3d) return '3D';
    return '2D';
  }
}
