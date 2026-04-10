import { ForbiddenException } from '@nestjs/common';

export function validarAcessoTelaAdmin(user: any) {
  if (user?.perfil !== 'DONO') {
    throw new ForbiddenException('Apenas o DONO pode acessar esta área.');
  }
}

export function validarAcessoFinanceiro(user: any) {
  const permitido =
    user?.perfil === 'DONO' || user?.matricula === 'JF003';

  if (!permitido) {
    throw new ForbiddenException(
      'Você não tem permissão para acessar relatórios financeiros.',
    );
  }
}