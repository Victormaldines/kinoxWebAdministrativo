import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../config/api.config';
import { authTokenInterceptor } from '../http/auth-token.interceptor';
import { FilmesService } from './filmes.service';
import { GenerosService } from './generos.service';

describe('GenerosService & FilmesService', () => {
  const apiBase = 'https://kinoxapi.onrender.com';
  let generosService: GenerosService;
  let filmesService: FilmesService;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: apiBase },
      ],
    });

    generosService = TestBed.inject(GenerosService);
    filmesService = TestBed.inject(FilmesService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const loginPromise = authService.login({ login: 'admin', senha: 'secret' });
    httpMock.expectOne(`${apiBase}/auth/login`).flush({
      token: 'jwt-admin-token',
      userId: 1,
      subject: 'admin',
      role: 'ADMIN',
    });
    await loginPromise;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('lists, creates, and deletes genres with Bearer JWT header', async () => {
    const listPromise = generosService.list();
    httpMock.expectOne(`${apiBase}/generos`).flush([{ id: 4, nome: 'Suspense' }]);
    expect((await listPromise).length).toBe(1);

    const createPromise = generosService.create({ nome: '  Noir  ' });
    const createReq = httpMock.expectOne(`${apiBase}/generos`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({ nome: 'Noir' });
    expect(createReq.request.headers.get('Authorization')).toBe('Bearer jwt-admin-token');
    createReq.flush({ id: 9, nome: 'Noir' });
    expect((await createPromise).id).toBe(9);

    const deletePromise = generosService.remove(9);
    const deleteReq = httpMock.expectOne(`${apiBase}/generos/9`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
    await deletePromise;
  });

  it('creates, updates, and removes films with sanitized payloads', async () => {
    const payload = {
      nome: '  V de Vingança  ',
      diretor: ' James McTeigue ',
      duracao: 120,
      classificacaoIndicativa: 12,
      sinopse: '  Sinopse completa de teste.  ',
      imagemUrl: ' https://img.example/v.jpg ',
      generosId: [4, 5],
    };

    const createPromise = filmesService.create(payload);
    const createReq = httpMock.expectOne(`${apiBase}/filmes`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({
      nome: 'V de Vingança',
      diretor: 'James McTeigue',
      duracao: 120,
      classificacaoIndicativa: 12,
      sinopse: 'Sinopse completa de teste.',
      imagemUrl: 'https://img.example/v.jpg',
      generosId: [4, 5],
    });
    createReq.flush({ id: 1, ...createReq.request.body, generos: [] });
    const created = await createPromise;
    expect(created.id).toBe(1);

    const updatePromise = filmesService.update(1, payload);
    const updateReq = httpMock.expectOne(`${apiBase}/filmes/1`);
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush({ id: 1, ...updateReq.request.body, generos: [] });
    await updatePromise;

    const removePromise = filmesService.remove(1);
    const removeReq = httpMock.expectOne(`${apiBase}/filmes/1`);
    expect(removeReq.request.method).toBe('DELETE');
    removeReq.flush(null);
    await removePromise;
  });
});
