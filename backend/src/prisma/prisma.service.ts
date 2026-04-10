import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Serviço Prisma (PrismaService)
 * 
 * Responsabilidades:
 * - Gerenciar conexão com banco de dados
 * - Fornecer acesso aos modelos Prisma
 * - Conectar ao banco quando o módulo é inicializado
 * - Disponibilizar instância única em toda aplicação (singleton)
 * 
 * Extends: PrismaClient - Herda todos os métodos Prisma para queries
 * Implements: OnModuleInit - Hook do NestJS para executar ações na inicialização
 * 
 * Uso:
 * - Injetar em qualquer serviço: constructor(private prisma: PrismaService)
 * - Usar como qualquer cliente Prisma: this.prisma.funcionarios.findMany()
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Hook executado quando o módulo é inicializado
   * Conecta ao banco de dados Prisma
   */
  async onModuleInit() {
    // Estabelece conexão com banco de dados
    await this.$connect();
  }
}
