export interface GeneroRequest {
  readonly nome: string;
}

export interface GeneroResponse {
  readonly id: number;
  readonly nome: string;
}

export interface FilmeRequest {
  readonly nome: string;
  readonly diretor: string;
  readonly duracao: number;
  readonly classificacaoIndicativa: number;
  readonly sinopse: string;
  readonly imagemUrl: string;
  readonly generosId: readonly number[];
}

export interface FilmeResponse {
  readonly id: number;
  readonly nome: string;
  readonly diretor: string;
  readonly duracao: number;
  readonly classificacaoIndicativa: number;
  readonly sinopse: string;
  readonly imagemUrl: string;
  readonly generos: readonly GeneroResponse[];
}

export interface SalaRequest {
  readonly numero: number;
  readonly precoDoIngresso: number;
  readonly qtdAssentos: number;
  readonly is3d: boolean;
  readonly isDisponivel: boolean;
  readonly isImax: boolean;
}

export interface SalaResponse {
  readonly id: number;
  readonly numero: number;
  readonly precoDoIngresso: number;
  readonly qtdAssentos: number;
  readonly is3d: boolean;
  readonly isDisponivel: boolean;
  readonly isImax: boolean;
}

export interface AssentoRequest {
  readonly numero: number;
  readonly salaId: number;
}

export interface AssentoResponse {
  readonly id: number;
  readonly numero: number;
}

export interface SessaoRequest {
  readonly filmeId: number;
  readonly salaId: number;
  readonly disponibilidade: boolean;
  readonly data: string;
  readonly horarioInicio: string;
  readonly isLegendado: boolean;
}

export interface SessaoAssentoResponse {
  readonly id: number;
  readonly assento: AssentoResponse;
  readonly isOcupado: boolean;
}

export interface SessaoResponse {
  readonly id: number;
  readonly disponibilidade: boolean;
  readonly data: string;
  readonly horarioInicio: string;
  readonly isLegendado: boolean;
  readonly filme: FilmeResponse;
  readonly sala: SalaResponse;
  readonly sessaoAssentos: readonly SessaoAssentoResponse[];
}
