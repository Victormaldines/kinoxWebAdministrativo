import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, buildApiUrl } from '../config/api.config';
import { GeneroRequest, GeneroResponse } from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class GenerosService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Promise<GeneroResponse[]> {
    const url = buildApiUrl(this.apiBaseUrl, '/generos');
    return firstValueFrom(this.http.get<GeneroResponse[]>(url));
  }

  create(payload: GeneroRequest): Promise<GeneroResponse> {
    const url = buildApiUrl(this.apiBaseUrl, '/generos');
    return firstValueFrom(
      this.http.post<GeneroResponse>(url, {
        nome: payload.nome.trim(),
      }),
    );
  }

  remove(id: number): Promise<void> {
    const url = buildApiUrl(this.apiBaseUrl, `/generos/${id}`);
    return firstValueFrom(this.http.delete<void>(url));
  }
}
