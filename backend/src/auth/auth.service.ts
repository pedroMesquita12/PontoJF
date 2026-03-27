import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(matricula: string, senha: string) {
    try {
      console.log('LOGIN RECEBIDO:', { matricula, senha });

      const funcionario = await this.prisma.funcionarios.findUnique({
        where: { matricula },
        include: {
          usuarios: true,
          cargos: true,
        },
      });

      console.log('FUNCIONARIO ENCONTRADO:', funcionario);

      if (!funcionario || !funcionario.usuarios) {
        throw new UnauthorizedException('Matrícula ou senha inválida');
      }

      if (!funcionario.usuarios.ativo) {
        throw new UnauthorizedException('Usuário inativo');
      }

      const senhaValida = await bcrypt.compare(
        senha,
        funcionario.usuarios.senha_hash,
      );

      console.log('SENHA VALIDA:', senhaValida);

      if (!senhaValida) {
        throw new UnauthorizedException('Matrícula ou senha inválida');
      }

      await this.prisma.usuarios.update({
        where: { id: funcionario.usuarios.id },
        data: { ultimo_login: new Date() },
      });

      return {
        user: {
          id: Number(funcionario.id),
          usuarioId: Number(funcionario.usuarios.id),
          nome: funcionario.usuarios.nome,
          email: funcionario.usuarios.email,
          matricula: funcionario.matricula,
          cargo: funcionario.cargos?.nome ?? 'Funcionário',
          perfil: funcionario.usuarios.perfil,
        },
      };
    } catch (error) {
      console.error('ERRO NO AUTH SERVICE:', error);
      throw error;
    }
  }
}