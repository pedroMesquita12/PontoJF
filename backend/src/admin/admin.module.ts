import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo Administrativo (AdminModule)
 * 
 * Organiza componentes para funcionalidades administrativas:
 * - Controllers: Expõem endpoints de gestão
 * - Services: Lógica de relatórios e overview
 * - Dependencies: Acesso ao banco via Prisma
 * 
 * Responsabilidades:
 * - Listar funcionários com status de ponto
 * - Calcular resumos de tempo trabalhado
 * - Gerar relatório overview (dashboard admin)
 * - Calcular estatísticas diárias, semanais, mensais
 */
@Module({
  controllers: [AdminController], // Controllers com endpoints HTTP
  providers: [AdminService, PrismaService], // Serviços e dependências
})
export class AdminModule {}