import { ForbiddenException } from '@nestjs/common';

export function validarAcessoTelaAdmin(user: any) {
  const perfil = String(user?.perfil || '').trim().toUpperCase();

  console.log('VALIDAÇÃO ADMIN - USER:', user);
  console.log('VALIDAÇÃO ADMIN - PERFIL:', perfil);

  if (perfil !== 'DONO') {
    throw new ForbiddenException('Apenas o DONO pode acessar esta área.');
  }
}

export function validarAcessoFinanceiro(user: any) {
  const perfil = String(user?.perfil || '').trim().toUpperCase();
  const matricula = String(user?.matricula || '').trim();

  const permitido = perfil === 'DONO' || matricula === 'JF003';

  if (!permitido) {
    throw new ForbiddenException(
      'Você não tem permissão para acessar relatórios financeiros.',
    );
  }
}