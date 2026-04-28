import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(matricula: string, senha: string) {
    try {
      const funcionario = await this.prisma.funcionarios.findUnique({
        where: { matricula },
        include: {
          usuarios: true,
          cargos: true,
        },
      });

      if (!funcionario || !funcionario.usuarios) {
        throw new UnauthorizedException("Matrícula ou senha inválida");
      }

      if (!funcionario.usuarios.ativo) {
        throw new UnauthorizedException("Usuário inativo");
      }

      const senhaValida = await bcrypt.compare(
        senha,
        funcionario.usuarios.senha_hash,
      );

      if (!senhaValida) {
        throw new UnauthorizedException("Matrícula ou senha inválida");
      }

      await this.prisma.usuarios.update({
        where: { id: funcionario.usuarios.id },
        data: { ultimo_login: new Date() },
      });

      const perfil = String(funcionario.usuarios.perfil || "")
        .trim()
        .toUpperCase();

      const empresaId = funcionario.empresa_id
        ? Number(funcionario.empresa_id)
        : null;

      const user = {
        id: Number(funcionario.id),
        funcionarioId: Number(funcionario.id),
        usuarioId: Number(funcionario.usuarios.id),
        nome: funcionario.usuarios.nome,
        email: funcionario.usuarios.email,
        matricula: funcionario.matricula,
        cargo: funcionario.cargos?.nome ?? "Funcionário",
        perfil,
        empresa_id: empresaId,
      };

      const payload = {
        sub: Number(funcionario.id),
        funcionarioId: Number(funcionario.id),
        usuarioId: Number(funcionario.usuarios.id),
        nome: funcionario.usuarios.nome,
        email: funcionario.usuarios.email,
        matricula: funcionario.matricula,
        perfil,
        empresa_id: empresaId,
      };

      this.logger.log(`Login bem-sucedido para matrícula ${matricula}`);

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      this.logger.warn(`Falha no login para matrícula ${matricula}`);
      throw error;
    }
  }
}
