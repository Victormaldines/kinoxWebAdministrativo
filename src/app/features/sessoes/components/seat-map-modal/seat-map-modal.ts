import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { normalizeApiError } from '../../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../../core/models/auth.models';
import { SessaoAssentoResponse, SessaoResponse } from '../../../../core/models/catalog.models';
import { SessoesService } from '../../../../core/services/sessoes.service';

interface SeatRowGroup {
  readonly rowLabel: string;
  readonly seats: readonly SessaoAssentoResponse[];
}

const SEATS_PER_ROW = 10;

@Component({
  selector: 'app-seat-map-modal',
  templateUrl: './seat-map-modal.html',
  styleUrl: './seat-map-modal.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class SeatMapModal {
  private readonly sessoesService = inject(SessoesService);

  readonly sessao = input<SessaoResponse | null>(null);
  readonly closeModal = output<void>();

  protected readonly liveSessao = signal<SessaoResponse | null>(null);
  protected readonly isRefreshing = signal(false);
  protected readonly refreshError = signal<ApiErrorInfo | null>(null);

  protected readonly activeSessao = computed(() => this.liveSessao() ?? this.sessao());

  protected readonly sortedSeats = computed<readonly SessaoAssentoResponse[]>(() => {
    const current = this.activeSessao();
    if (!current?.sessaoAssentos) return [];
    return [...current.sessaoAssentos].sort(
      (a, b) => (a.assento?.numero ?? a.id) - (b.assento?.numero ?? b.id),
    );
  });

  protected readonly seatRows = computed<readonly SeatRowGroup[]>(() => {
    const seats = this.sortedSeats();
    const rows: SeatRowGroup[] = [];
    for (let i = 0; i < seats.length; i += SEATS_PER_ROW) {
      const rowIndex = Math.floor(i / SEATS_PER_ROW);
      const rowLabel = String.fromCharCode(65 + (rowIndex % 26));
      rows.push({
        rowLabel,
        seats: seats.slice(i, i + SEATS_PER_ROW),
      });
    }
    return rows;
  });

  protected readonly totalSeats = computed(() => this.sortedSeats().length);
  protected readonly occupiedSeats = computed(
    () => this.sortedSeats().filter((s) => s.isOcupado).length,
  );
  protected readonly freeSeats = computed(() => this.totalSeats() - this.occupiedSeats());
  protected readonly occupancyPercent = computed(() => {
    const total = this.totalSeats();
    return total > 0 ? Math.round((this.occupiedSeats() / total) * 100) : 0;
  });

  constructor() {
    effect(() => {
      const target = this.sessao();
      if (!target) {
        this.liveSessao.set(null);
        this.refreshError.set(null);
        return;
      }

      this.liveSessao.set(target);
      void this.refreshSessao(target.id);
    });
  }

  protected async refreshSessao(id: number): Promise<void> {
    this.isRefreshing.set(true);
    this.refreshError.set(null);

    try {
      const fresh = await this.sessoesService.getById(id);
      if (this.sessao()?.id === id) {
        this.liveSessao.set(fresh);
      }
    } catch (error: unknown) {
      this.refreshError.set(normalizeApiError(error));
    } finally {
      this.isRefreshing.set(false);
    }
  }

  protected onEscape(): void {
    if (this.sessao() !== null) {
      this.closeModal.emit();
    }
  }

  protected onClose(): void {
    this.closeModal.emit();
  }

  protected formatDate(isoDate: string): string {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  protected formatTime(time: string): string {
    return time ? time.slice(0, 5) : '--:--';
  }

  protected formatNumero(num: number): string {
    return num < 10 ? `0${num}` : String(num);
  }

  protected formatRoom(sessao: SessaoResponse): string {
    const num = sessao.sala?.numero ?? 0;
    const label = num < 10 ? `0${num}` : String(num);
    const tech = sessao.sala?.isImax ? 'IMAX' : sessao.sala?.is3d ? '3D' : '2D';
    const audio = sessao.isLegendado ? 'LEG' : 'DUB';
    return `Sala ${label} · ${audio} · ${tech}`;
  }
}
