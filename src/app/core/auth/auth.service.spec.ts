import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { authErrorInterceptor } from '../http/auth-error.interceptor';
import { authTokenInterceptor } from '../http/auth-token.interceptor';
import { AdminRoleRequiredError } from '../http/http-error.util';
import { adminAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';

describe('Kinox Auth & HTTP Infrastructure', () => {
  const testApiBase = 'https://kinoxapi.onrender.com';
  let authService: AuthService;
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', redirectTo: 'login', pathMatch: 'full' },
          { path: 'login', children: [] },
          { path: 'filmes', canActivate: [adminAuthGuard], children: [] },
        ]),
        provideHttpClient(withInterceptors([authTokenInterceptor, authErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: testApiBase },
      ],
    });

    authService = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('authenticates ADMIN user and attaches Bearer token on subsequent Kinox API calls', async () => {
    const loginPromise = authService.login({ login: 'admin', senha: 'secret' });

    const loginReq = httpMock.expectOne(`${testApiBase}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.headers.has('Authorization')).toBe(false);
    loginReq.flush({
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.sig',
      userId: 1,
      subject: 'admin',
      role: 'ADMIN',
    });

    const session = await loginPromise;
    expect(session.subject).toBe('admin');
    expect(authService.isAuthenticated()).toBe(true);

    const filmesPromise = firstValueFrom(http.get(`${testApiBase}/filmes`));
    const filmesReq = httpMock.expectOne(`${testApiBase}/filmes`);
    expect(filmesReq.request.headers.get('Authorization')).toBe(
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.sig',
    );
    filmesReq.flush([]);
    await filmesPromise;
  });

  it('rejects CLIENTE role login and preserves unauthenticated state', async () => {
    const loginPromise = authService.login({ login: 'cliente@mail.com', senha: 'secret' });

    const req = httpMock.expectOne(`${testApiBase}/auth/login`);
    req.flush({
      token: 'jwt-client',
      userId: 42,
      subject: 'cliente@mail.com',
      role: 'CLIENTE',
    });

    await expect(loginPromise).rejects.toThrow(AdminRoleRequiredError);
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('blocks unauthenticated navigation in adminAuthGuard and redirects to /login with return url', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard({} as never, { url: '/filmes' } as never),
    );
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?redirect=%2Ffilmes');
  });

  it('clears session on 401 from protected Kinox endpoint', async () => {
    const loginPromise = authService.login({ login: 'admin', senha: 'secret' });
    httpMock.expectOne(`${testApiBase}/auth/login`).flush({
      token: 'jwt-admin',
      userId: 1,
      subject: 'admin',
      role: 'ROLE_ADMIN',
    });
    await loginPromise;
    expect(authService.isAuthenticated()).toBe(true);

    const reqPromise = firstValueFrom(http.get(`${testApiBase}/administradores`)).catch(
      (err) => err,
    );
    const protectedReq = httpMock.expectOne(`${testApiBase}/administradores`);
    protectedReq.flush({ message: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });
    await reqPromise;

    expect(authService.isAuthenticated()).toBe(false);
  });
});
