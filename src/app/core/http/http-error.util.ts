import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorInfo } from '../models/auth.models';

export class AdminRoleRequiredError extends Error {
  constructor(readonly receivedRole: string) {
    super(
      `A conta autenticada possui perfil "${receivedRole}". Este painel exige uma credencial ADMIN.`,
    );
    this.name = 'AdminRoleRequiredError';
  }
}

export function normalizeApiError(error: unknown): ApiErrorInfo {
  if (error instanceof AdminRoleRequiredError) {
    return {
      status: 403,
      title: 'Acesso restrito a administradores',
      detail: error.message,
      recoverable: false,
    };
  }

  if (error instanceof HttpErrorResponse) {
    const backendMessage = extractBackendMessage(error.error);

    if (error.status === 0) {
      return {
        status: 0,
        title: 'API Kinox indisponível no momento',
        detail:
          'Não foi possível alcançar kinoxapi.onrender.com. Se o servidor estiver acordando (cold start do Render), aguarde alguns segundos e tente novamente.',
        recoverable: true,
      };
    }

    if (error.status === 401) {
      return {
        status: 401,
        title: 'Credenciais inválidas',
        detail:
          backendMessage ??
          'Login ou senha incorretos, ou token expirado. Revise suas credenciais de administrador e tente novamente.',
        recoverable: true,
      };
    }

    if (error.status === 403) {
      return {
        status: 403,
        title: 'Permissão insuficiente',
        detail:
          backendMessage ??
          'Esta operação exige privilégio exclusivo ADMIN. Verifique o perfil da sua conta.',
        recoverable: false,
      };
    }

    if (error.status === 400 || error.status === 422) {
      return {
        status: error.status,
        title: 'Dados inválidos na requisição',
        detail:
          backendMessage ??
          'A API recusou os campos informados. Confira os dados preenchidos e tente novamente.',
        recoverable: true,
      };
    }

    if (error.status >= 500) {
      return {
        status: error.status,
        title: `Falha interna da API (HTTP ${error.status})`,
        detail:
          backendMessage ??
          'O servidor Kinox encontrou um erro ao processar o pedido. Aguarde instantes e tente novamente.',
        recoverable: true,
      };
    }

    return {
      status: error.status,
      title: `Erro na comunicação (HTTP ${error.status})`,
      detail: backendMessage ?? 'Não foi possível concluir a operação solicitada.',
      recoverable: true,
    };
  }

  return {
    status: -1,
    title: 'Erro inesperado',
    detail: 'Ocorreu uma falha inesperada durante a requisição. Tente novamente.',
    recoverable: true,
  };
}

function extractBackendMessage(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed.length > 0 && trimmed.length < 240 ? trimmed : null;
  }
  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidate = record['message'] ?? record['detail'] ?? record['error'];
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}
