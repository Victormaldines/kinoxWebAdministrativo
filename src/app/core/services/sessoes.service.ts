import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, buildApiUrl } from '../config/api.config';
import { SessaoResponse } from '../models/catalog.models';

export function parseSessaoDateTime(data: string, horarioInicio: string): Date | null {
  if (!data || !horarioInicio) return null;
  const dateParts = data.split('-').map(Number);
  const timeParts = horarioInicio.split(':').map(Number);

  if (dateParts.length < 3 || timeParts.length < 2) return null;
  const [year, month, day] = dateParts;
  const [hour, minute, second = 0] = timeParts;

  if ([year, month, day, hour, minute, second].some((n) => Number.isNaN(n))) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, second);
}

export function isUpcomingSessao(sessao: SessaoResponse, referenceNow = new Date()): boolean {
  const start = parseSessaoDateTime(sessao.data, sessao.horarioInicio);
  if (!start) return false;
  return start.getTime() >= referenceNow.getTime();
}

@Injectable({ providedIn: 'root' })
export class SessoesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Promise<SessaoResponse[]> {
    const url = buildApiUrl(this.apiBaseUrl, '/sessoes');
    return firstValueFrom(this.http.get<SessaoResponse[]>(url));
  }

  getById(id: number): Promise<SessaoResponse> {
    const url = buildApiUrl(this.apiBaseUrl, `/sessoes/${id}`);
    return firstValueFrom(this.http.get<SessaoResponse>(url));
  }
}
