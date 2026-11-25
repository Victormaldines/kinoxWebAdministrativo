import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../config/api.config';
import { authTokenInterceptor } from '../http/auth-token.interceptor';
import { SalasService } from './salas.service';

describe('SalasService', () => {
  const apiBase = 'https://kinoxapi.onrender.com';
  let salasService: SalasService;
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

    salasService = TestBed.inject(SalasService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const loginPromise = authService.login({ login: 'admin', senha: 'secret' });
    httpMock.expectOne(`${apiBase}/auth/login`).flush({
      token: 'jwt-salas-token',
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

  it('lists, creates, and updates rooms with Bearer JWT header', async () => {
    const listPromise = salasService.list();
    httpMock.expectOne(`${apiBase}/salas`).flush([
      {
        id: 1,
        numero: 1,
        precoDoIngresso: 45,
        qtdAssentos: 120,
        is3d: true,
        isImax: true,
        isDisponivel: true,
      },
    ]);
    expect((await listPromise).length).toBe(1);

    const payload = {
      numero: 2,
      precoDoIngresso: 38,
      qtdAssentos: 90,
      is3d: true,
      isImax: false,
      isDisponivel: true,
    };
    const createPromise = salasService.create(payload);
    const createReq = httpMock.expectOne(`${apiBase}/salas`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.headers.get('Authorization')).toBe('Bearer jwt-salas-token');
    expect(createReq.request.body).toEqual(payload);
    createReq.flush({ id: 2, ...payload });
    expect((await createPromise).id).toBe(2);

    const updatePromise = salasService.update(2, { ...payload, isDisponivel: false });
    const updateReq = httpMock.expectOne(`${apiBase}/salas/2`);
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush({ id: 2, ...payload, isDisponivel: false });
    expect((await updatePromise).isDisponivel).toBe(false);
  });

  it('creates and removes physical seats via /assentos endpoints', async () => {
    const createSeatPromise = salasService.createAssento({ numero: 91, salaId: 2 });
    const createReq = httpMock.expectOne(`${apiBase}/assentos`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({ numero: 91, salaId: 2 });
    createReq.flush({ id: 501, numero: 91 });
    expect((await createSeatPromise).id).toBe(501);

    const deleteSeatPromise = salasService.removeAssento(501);
    const deleteReq = httpMock.expectOne(`${apiBase}/assentos/501`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
    await deleteSeatPromise;
  });
});
