import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DISPLAY_KINOX_API_HOST } from '../../../core/config/api.config';
import { normalizeApiError } from '../../../core/http/http-error.util';
import { ApiErrorInfo } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login-page',
  imports: [FormField, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly apiHost = DISPLAY_KINOX_API_HOST;

  private readonly credentialsModel = signal({
    login: '',
    senha: '',
  });

  protected readonly loginForm = form(this.credentialsModel, (schemaPath) => {
    required(schemaPath.login, { message: 'Informe o login de administrador.' });
    minLength(schemaPath.login, 3, {
      message: 'O login deve conter ao menos 3 caracteres.',
    });
    required(schemaPath.senha, { message: 'Informe a senha de acesso.' });
    minLength(schemaPath.senha, 4, {
      message: 'A senha deve conter ao menos 4 caracteres.',
    });
  });

  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isSlowRequest = signal(false);
  protected readonly apiError = signal<ApiErrorInfo | null>(null);

  protected readonly sessionReason = computed(() =>
    this.route.snapshot.queryParamMap.get('motivo'),
  );

  protected readonly redirectTarget = computed(() => {
    const raw = this.route.snapshot.queryParamMap.get('redirect');
    if (raw && raw.startsWith('/') && !raw.startsWith('//') && raw !== '/login') {
      return raw;
    }
    return '/';
  });

  protected readonly loginError = computed(() => {
    const state = this.loginForm.login();
    if (!state.touched() || state.valid()) return null;
    return state.errors()[0]?.message ?? 'Login inválido.';
  });

  protected readonly passwordError = computed(() => {
    const state = this.loginForm.senha();
    if (!state.touched() || state.valid()) return null;
    return state.errors()[0]?.message ?? 'Senha inválida.';
  });

  private slowTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearSlowTimer();
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting()) return;

    this.apiError.set(null);

    await submit(this.loginForm, async (field) => {
      this.isSubmitting.set(true);
      this.isSlowRequest.set(false);
      this.clearSlowTimer();

      this.slowTimer = setTimeout(() => {
        if (this.isSubmitting()) {
          this.isSlowRequest.set(true);
        }
      }, 3500);

      try {
        await this.auth.login(field().value());
        await this.router.navigateByUrl(this.redirectTarget());
      } catch (error: unknown) {
        this.apiError.set(normalizeApiError(error));
      } finally {
        this.clearSlowTimer();
        this.isSubmitting.set(false);
        this.isSlowRequest.set(false);
      }
    });
  }

  private clearSlowTimer(): void {
    if (this.slowTimer !== null) {
      clearTimeout(this.slowTimer);
      this.slowTimer = null;
    }
  }
}
