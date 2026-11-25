import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { API_BASE_URL } from './core/config/api.config';
import { LoginPage } from './features/auth/login-page/login-page';
import { FilmesPage } from './features/filmes/filmes-page/filmes-page';
import { GenerosPage } from './features/generos/generos-page/generos-page';
import { HomePage } from './features/home/home-page';
import { SalasPage } from './features/salas/salas-page/salas-page';
import { SessoesPage } from './features/sessoes/sessoes-page/sessoes-page';

describe('Kinox Admin App', () => {
  const apiBase = 'https://kinoxapi.onrender.com';
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App, HomePage, LoginPage, GenerosPage, FilmesPage, SalasPage, SessoesPage],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: apiBase },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the root app shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should keep eye hero without constellation and hide admin CTAs on HomePage when unauthenticated', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Central Administrativa');
    expect(compiled.querySelector('.kx-aperture')).toBeTruthy();
    expect(compiled.querySelectorAll('.kx-frame').length).toBe(0);
    expect(compiled.textContent).not.toContain('Novo filme');
    expect(compiled.textContent).not.toContain('Gerenciar filmes');
    expect(compiled.textContent).not.toContain('Abrir grade de sessões');
    expect(compiled.textContent).not.toContain('Configurar salas');
    expect(compiled.textContent).not.toContain('Gerenciar gêneros');
    expect(compiled.textContent).not.toContain('MOD-BIL');
    expect(compiled.textContent).not.toContain('MOD-CLI');
    expect(compiled.textContent).not.toContain('MOD-ADM');
  });

  it('should render constellation, all modules, and admin CTAs on HomePage when authenticated', async () => {
    const auth = TestBed.inject(AuthService);
    const loginPromise = auth.login({ login: 'admin', senha: 'secret' });
    httpMock.expectOne(`${apiBase}/auth/login`).flush({
      token: 'jwt-admin',
      userId: 1,
      subject: 'admin',
      role: 'ADMIN',
    });
    await loginPromise;

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.kx-aperture')).toBeTruthy();
    expect(compiled.querySelectorAll('.kx-frame').length).toBe(10);
    expect(compiled.textContent).toContain('Novo filme');
    expect(compiled.textContent).toContain('Gerenciar filmes');
    expect(compiled.textContent).toContain('Abrir grade de sessões');
    expect(compiled.textContent).toContain('Configurar salas');
    expect(compiled.textContent).toContain('Gerenciar gêneros');
    expect(compiled.textContent).toContain('MOD-BIL');
    expect(compiled.textContent).toContain('MOD-CLI');
    expect(compiled.textContent).toContain('MOD-ADM');
  });

  it('should render the Login Admin page with Signal Forms fields', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Acesso Administrativo');
    expect(compiled.querySelector('#kx-login-input')).toBeTruthy();
    expect(compiled.querySelector('#kx-password-input')).toBeTruthy();
  });

  it('should render GenerosPage and populate genres from GET /generos', async () => {
    const fixture = TestBed.createComponent(GenerosPage);
    fixture.detectChanges();

    httpMock.expectOne(`${apiBase}/generos`).flush([
      { id: 4, nome: 'Suspense' },
      { id: 5, nome: 'Ficção Científica' },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gêneros');
    expect(compiled.textContent).toContain('Suspense');
    expect(compiled.textContent).toContain('Ficção Científica');
  });

  it('should render FilmesPage and populate films + genres from API', async () => {
    const fixture = TestBed.createComponent(FilmesPage);
    fixture.detectChanges();

    httpMock.expectOne(`${apiBase}/filmes`).flush([
      {
        id: 1,
        nome: 'V de Vingança',
        diretor: 'James McTeigue',
        duracao: 120,
        classificacaoIndicativa: 12,
        sinopse: 'Sinopse oficial do filme.',
        imagemUrl: 'https://img.example/v.jpg',
        generos: [{ id: 4, nome: 'Suspense' }],
      },
    ]);
    httpMock.expectOne(`${apiBase}/generos`).flush([{ id: 4, nome: 'Suspense' }]);

    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Filmes');
    expect(compiled.textContent).toContain('V de Vingança');
    expect(compiled.textContent).toContain('James McTeigue');
    expect(compiled.textContent).toContain('02:00');
    expect(compiled.textContent).not.toContain('DURAÇÃO MÉDIA');
  });

  it('should render SalasPage and populate rooms from GET /salas', async () => {
    const fixture = TestBed.createComponent(SalasPage);
    fixture.detectChanges();

    httpMock.expectOne(`${apiBase}/salas`).flush([
      {
        id: 1,
        numero: 1,
        precoDoIngresso: 48,
        qtdAssentos: 140,
        is3d: true,
        isImax: true,
        isDisponivel: true,
      },
    ]);

    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Salas');
    expect(compiled.textContent).toContain('SALA 01');
    expect(compiled.textContent).toContain('IMAX');
  });

  it('should render SessoesPage with only upcoming sessions and open read-only seat map modal', async () => {
    const fixture = TestBed.createComponent(SessoesPage);
    fixture.detectChanges();

    const futureSession = {
      id: 10,
      disponibilidade: true,
      data: '2099-12-31',
      horarioInicio: '21:00:00',
      isLegendado: true,
      filme: {
        id: 1,
        nome: 'V de Vingança',
        diretor: 'James McTeigue',
        duracao: 120,
        classificacaoIndicativa: 12,
        sinopse: 'Sinopse.',
        imagemUrl: '',
        generos: [],
      },
      sala: {
        id: 1,
        numero: 1,
        precoDoIngresso: 40,
        qtdAssentos: 4,
        is3d: false,
        isImax: true,
        isDisponivel: true,
      },
      sessaoAssentos: [
        { id: 1, assento: { id: 81, numero: 1 }, isOcupado: false },
        { id: 2, assento: { id: 82, numero: 2 }, isOcupado: true },
      ],
    };

    const pastSession = {
      ...futureSession,
      id: 9,
      data: '2020-01-01',
      horarioInicio: '10:00:00',
      filme: { ...futureSession.filme, nome: 'Sessão Passada' },
    };

    httpMock.expectOne(`${apiBase}/sessoes`).flush([pastSession, futureSession]);

    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Grade de Sessões');
    expect(compiled.textContent).toContain('V de Vingança');
    expect(compiled.textContent).not.toContain('Sessão Passada');

    const mapButton = compiled.querySelector('.kx-sessao-action button') as HTMLButtonElement;
    expect(mapButton).toBeTruthy();
    mapButton.click();
    fixture.detectChanges();

    httpMock.expectOne(`${apiBase}/sessoes/10`).flush(futureSession);
    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('[role="dialog"]')).toBeTruthy();
    expect(compiled.querySelectorAll('.kx-seat').length).toBe(2);
    expect(compiled.querySelectorAll('.kx-seat.is-occupied').length).toBe(1);
  });

  it('should allow authenticated admins to open the new session drawer and create a session on SessoesPage', async () => {
    const auth = TestBed.inject(AuthService);
    const loginPromise = auth.login({ login: 'admin', senha: 'secret' });
    httpMock.expectOne(`${apiBase}/auth/login`).flush({
      token: 'jwt-admin',
      userId: 1,
      subject: 'admin',
      role: 'ADMIN',
    });
    await loginPromise;

    const fixture = TestBed.createComponent(SessoesPage);
    fixture.detectChanges();

    httpMock.expectOne(`${apiBase}/sessoes`).flush([]);
    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const createButton = compiled.querySelector('.kx-sessoes-header__actions .kx-btn-primary') as HTMLButtonElement;
    expect(createButton).toBeTruthy();
    expect(createButton.textContent).toContain('Nova sessão');

    createButton.click();
    fixture.detectChanges();

    const film = {
      id: 1,
      nome: 'Interestelar',
      diretor: 'Christopher Nolan',
      duracao: 169,
      classificacaoIndicativa: 10,
      sinopse: 'Sinopse.',
      imagemUrl: '',
      generos: [],
    };
    const sala = {
      id: 2,
      numero: 1,
      precoDoIngresso: 45,
      qtdAssentos: 40,
      is3d: false,
      isImax: true,
      isDisponivel: true,
    };

    httpMock.expectOne(`${apiBase}/filmes`).flush([film]);
    httpMock.expectOne(`${apiBase}/salas`).flush([sala]);
    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    const dateInput = compiled.querySelector('#kx-sessao-data') as HTMLInputElement;
    dateInput.value = '2099-12-31';
    dateInput.dispatchEvent(new Event('input'));
    const timeInput = compiled.querySelector('#kx-sessao-horario') as HTMLInputElement;
    timeInput.value = '21:15';
    timeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const formEl = compiled.querySelector('.kx-sdrawer__form') as HTMLFormElement;
    formEl.dispatchEvent(new Event('submit'));

    const postReq = httpMock.expectOne(`${apiBase}/sessoes`);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({
      filmeId: 1,
      salaId: 2,
      disponibilidade: true,
      data: '2099-12-31',
      horarioInicio: '21:15:00',
      isLegendado: true,
    });

    postReq.flush({
      id: 99,
      disponibilidade: true,
      data: '2099-12-31',
      horarioInicio: '21:15:00',
      isLegendado: true,
      filme: film,
      sala,
      sessaoAssentos: [],
    });

    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Interestelar');
    expect(compiled.textContent).toContain('Grade atualizada');
  });
});
