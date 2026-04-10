import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Serviço de autenticação (AuthService)
 * 
 * Responsabilidades:
 * - Validar credenciais de funcionários (matrícula e senha)
 * - Verificar se o usuário está ativo
 * - Comparar senha informada com hash armazenado
 * - Atualizar timestamp do último login
 * - Retornar dados do usuário autenticado
 */
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Realiza login do usuário
   * @param matricula - Matrícula do funcionário
   * @param senha - Senha em texto plano (será comparada com hash)
   * @returns Objeto com dados do usuário autenticado
   * @throws UnauthorizedException - Se credenciais inválidas ou usuário inativo
   */
  async login(matricula: string, senha: string) {
    try {
      // Log para debug - registra a tentativa de login (removido em produção)
      console.log('LOGIN RECEBIDO:', { matricula, senha });

      // Busca o funcionário no banco de dados pela matrícula
      const funcionario = await this.prisma.funcionarios.findUnique({
        where: { matricula },
        include: {
          usuarios: true, // Inclui dados do usuário associado
          cargos: true,   // Inclui dados do cargo do funcionário
        },
      });

      // Log para debug - exibe funcionário encontrado
      console.log('FUNCIONARIO ENCONTRADO:', funcionario);

      // Validação 1: Verifica se funcionário existe e possui usuário associado
      if (!funcionario || !funcionario.usuarios) {
        throw new UnauthorizedException('Matrícula ou senha inválida');
      }

      // Validação 2: Verifica se o usuário está ativo
      if (!funcionario.usuarios.ativo) {
        throw new UnauthorizedException('Usuário inativo');
      }

      // Validação 3: Compara a senha informada com o hash armazenado no banco
      const senhaValida = await bcrypt.compare(
        senha,
        funcionario.usuarios.senha_hash,
      );

      // Log para debug - exibe resultado da validação de senha
      console.log('SENHA VALIDA:', senhaValida);

      // Se a senha for inválida, lança exceção
      if (!senhaValida) {
        throw new UnauthorizedException('Matrícula ou senha inválida');
      }

      // Atualiza o timestamp do último login do usuário
      await this.prisma.usuarios.update({
        where: { id: funcionario.usuarios.id },
        data: { ultimo_login: new Date() },
      });

      // Retorna dados do usuário autenticado para o frontend
      return {
        user: {
          id: Number(funcionario.id),
          usuarioId: Number(funcionario.usuarios.id),
          nome: funcionario.usuarios.nome,
          email: funcionario.usuarios.email,
          matricula: funcionario.matricula,
          cargo: funcionario.cargos?.nome ?? 'Funcionário', // Retorna cargo ou valor padrão
          perfil: funcionario.usuarios.perfil,
        },
      };
    } catch (error) {
      // Log de erro para debug e troubleshooting
      console.error('ERRO NO AUTH SERVICE:', error);
      // Re-lança o erro para que seja tratado pela camada de controllers
      throw error;
    }
  }
}