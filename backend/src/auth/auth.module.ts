import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo de Autenticação (AuthModule)
 * 
 * Organiza e agrupa componentes relacionados à autenticação:
 * - Controllers: Expõem endpoints de login
 * - Services: Lógica de validação de credenciais
 * - Providers: Dependências injetadas (AuthService, PrismaService)
 * 
 * Responsabilidades:
 * - Validar matrícula e senha
 * - Verificar status do usuário (ativo/inativo)
 * - Atualizar timestamp de último login
 * - Retornar dados do usuário autenticado
 */
@Module({
  controllers: [AuthController], // Controllers que expõem endpoints HTTP
  providers: [AuthService, PrismaService], // Serviços e dependências injetáveis
})
export class AuthModule {}