import { Module } from '@nestjs/common';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo de Relatórios (RelatoriosModule)
 * 
 * Organiza componentes para gerenciamento de relatórios de entregas:
 * - Controllers: Expõem endpoints de importação, listagem e exportação
 * - Services: Lógica de processamento de arquivos, filtros, cálculos
 * - Dependencies: Acesso ao banco de dados via Prisma
 * 
 * Responsabilidades:
 * - Importar relatórios (CSV/XLSX)
 * - Listar entregas com filtros
 * - Exportar dados para Excel
 * - Calcular estatísticas financeiras
 * - Gerenciar dados de entregas
 */
@Module({
  controllers: [RelatoriosController], // Controllers com endpoints HTTP
  providers: [RelatoriosService, PrismaService], // Serviços e dependências
})
export class RelatoriosModule {}