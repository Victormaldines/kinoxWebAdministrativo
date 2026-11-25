import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, buildApiUrl } from '../config/api.config';
import { FilmeRequest, FilmeResponse } from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class FilmesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Promise<FilmeResponse[]> {
    const url = buildApiUrl(this.apiBaseUrl, '/filmes');
    return firstValueFrom(this.http.get<FilmeResponse[]>(url));
  }

  getById(id: number): Promise<FilmeResponse> {
    const url = buildApiUrl(this.apiBaseUrl, `/filmes/${id}`);
    return firstValueFrom(this.http.get<FilmeResponse>(url));
  }

  create(payload: FilmeRequest): Promise<FilmeResponse> {
    const url = buildApiUrl(this.apiBaseUrl, '/filmes');
    return firstValueFrom(this.http.post<FilmeResponse>(url, this.sanitizePayload(payload)));
  }

  update(id: number, payload: FilmeRequest): Promise<FilmeResponse> {
    const url = buildApiUrl(this.apiBaseUrl, `/filmes/${id}`);
    return firstValueFrom(this.http.put<FilmeResponse>(url, this.sanitizePayload(payload)));
  }

  remove(id: number): Promise<void> {
    const url = buildApiUrl(this.apiBaseUrl, `/filmes/${id}`);
    return firstValueFrom(this.http.delete<void>(url));
  }

  private sanitizePayload(payload: FilmeRequest): FilmeRequest {
    return {
      nome: payload.nome.trim(),
      diretor: payload.diretor.trim(),
      duracao: Number(payload.duracao),
      classificacaoIndicativa: Number(payload.classificacaoIndicativa),
      sinopse: payload.sinopse.trim(),
      imagemUrl: payload.imagemUrl.trim(),
      generosId: [...payload.generosId],
    };
  }
}
