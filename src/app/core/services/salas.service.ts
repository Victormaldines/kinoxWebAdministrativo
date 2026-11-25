import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, buildApiUrl } from '../config/api.config';
import {
  AssentoRequest,
  AssentoResponse,
  SalaRequest,
  SalaResponse,
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class SalasService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Promise<SalaResponse[]> {
    const url = buildApiUrl(this.apiBaseUrl, '/salas');
    return firstValueFrom(this.http.get<SalaResponse[]>(url));
  }

  getById(id: number): Promise<SalaResponse> {
    const url = buildApiUrl(this.apiBaseUrl, `/salas/${id}`);
    return firstValueFrom(this.http.get<SalaResponse>(url));
  }

  create(payload: SalaRequest): Promise<SalaResponse> {
    const url = buildApiUrl(this.apiBaseUrl, '/salas');
    return firstValueFrom(this.http.post<SalaResponse>(url, this.sanitizeSala(payload)));
  }

  update(id: number, payload: SalaRequest): Promise<SalaResponse> {
    const url = buildApiUrl(this.apiBaseUrl, `/salas/${id}`);
    return firstValueFrom(this.http.put<SalaResponse>(url, this.sanitizeSala(payload)));
  }

  createAssento(payload: AssentoRequest): Promise<AssentoResponse> {
    const url = buildApiUrl(this.apiBaseUrl, '/assentos');
    return firstValueFrom(
      this.http.post<AssentoResponse>(url, {
        numero: Number(payload.numero),
        salaId: Number(payload.salaId),
      }),
    );
  }

  removeAssento(id: number): Promise<void> {
    const url = buildApiUrl(this.apiBaseUrl, `/assentos/${id}`);
    return firstValueFrom(this.http.delete<void>(url));
  }

  private sanitizeSala(payload: SalaRequest): SalaRequest {
    return {
      numero: Number(payload.numero),
      precoDoIngresso: Number(payload.precoDoIngresso),
      qtdAssentos: Number(payload.qtdAssentos),
      is3d: Boolean(payload.is3d),
      isDisponivel: Boolean(payload.isDisponivel),
      isImax: Boolean(payload.isImax),
    };
  }
}
