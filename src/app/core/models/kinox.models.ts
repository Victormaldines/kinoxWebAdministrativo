export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ModuleCategory =
  | 'todos'
  | 'programacao'
  | 'infraestrutura'
  | 'bilheteria'
  | 'governanca';

export interface ConstellationFilm {
  readonly id: number;
  readonly reelCode: string;
  readonly title: string;
  readonly director: string;
  readonly durationMinutes: number;
  readonly ageRating: string;
  readonly genres: readonly string[];
  readonly synopsis: string;
  readonly imagePath: string;
  readonly imageAlt: string;
  readonly scheduledRoom: string;
  readonly nextSession: string;
  readonly formatLabel: string;
  readonly fromLiveApi?: boolean;
  /** Slight organic radius offset (-0.09 to +0.09) so frames mimic editorial staggered constellation */
  readonly radialOffset: number;
  /** Subtle width proportion variation (0.88 to 1.14) */
  readonly sizeScale: number;
}

export interface ApiEndpointSpec {
  readonly method: HttpMethod;
  readonly path: string;
  readonly summary: string;
  readonly auth: 'ADMIN' | 'PÚBLICA' | 'ADMIN / CLIENTE';
}

export interface AdminModuleItem {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly subtitle: string;
  readonly category: Exclude<ModuleCategory, 'todos'>;
  readonly categoryLabel: string;
  readonly primaryRoute: string;
  readonly countValue: string;
  readonly countUnit: string;
  readonly statusLabel: string;
  readonly primaryActionLabel: string;
  readonly endpoints: readonly ApiEndpointSpec[];
  readonly highlights: readonly string[];
}

export interface DailyScreeningPreview {
  readonly id: string;
  readonly time: string;
  readonly filmTitle: string;
  readonly roomName: string;
  readonly audioType: 'LEG' | 'DUB';
  readonly format: 'IMAX' | '3D' | '2D';
  readonly occupiedSeats: number;
  readonly totalSeats: number;
  readonly available: boolean;
}

export interface RoomStatusPreview {
  readonly numero: number;
  readonly capacidade: number;
  readonly preco: number;
  readonly isImax: boolean;
  readonly is3d: boolean;
  readonly isDisponivel: boolean;
}
