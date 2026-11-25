import { Routes } from '@angular/router';
import { adminAuthGuard, guestOnlyGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    canActivate: [guestOnlyGuard],
    loadComponent: () =>
      import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'filmes',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/filmes/filmes-page/filmes-page').then((m) => m.FilmesPage),
  },
  {
    path: 'generos',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/generos/generos-page/generos-page').then((m) => m.GenerosPage),
  },
  {
    path: 'salas',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/salas/salas-page/salas-page').then((m) => m.SalasPage),
  },
  {
    path: 'sessoes',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/sessoes/sessoes-page/sessoes-page').then((m) => m.SessoesPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
