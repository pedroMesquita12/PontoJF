import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class MatriculaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const perfil = String(user.perfil || '').trim().toUpperCase();
    const perfisPermitidos = ['DONO', 'ADMIN', 'GERENTE', 'SUPERVISOR'];

    if (!perfisPermitidos.includes(perfil)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar relatórios',
      );
    }

    return true;
  }
}
