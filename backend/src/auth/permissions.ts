import { ForbiddenException } from '@nestjs/common';

export function validarAcessoTelaAdmin(user: any) {
  const perfil = String(user?.perfil || '').trim().toUpperCase();

  if (!['DONO', 'ADMIN', 'GERENTE', 'SUPERVISOR'].includes(perfil)) {
    throw new ForbiddenException('Você não tem permissão para acessar esta área.');
  }
}

export function validarAcessoFinanceiro(user: any) {
  const perfil = String(user?.perfil || '').trim().toUpperCase();

  if (!['DONO', 'ADMIN', 'GERENTE', 'SUPERVISOR'].includes(perfil)) {
    throw new ForbiddenException(
      'Você não tem permissão para acessar relatórios',
    );
  }
}