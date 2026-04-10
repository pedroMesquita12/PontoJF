import { Module } from '@nestjs/common';
import { PontoController } from './ponto.controller';
import { PontoService } from './ponto.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

/**
 * Módulo de Ponto (PontoModule)
 * 
 * Organiza componentes para gestão de registros de ponto:
 * - Controllers: Expõem endpoints de registro e listagem
 * - Services: Lógica de validação GPS, cálculo de tempo, integração WhatsApp
 * - Dependencies: WhatsappModule para notificações
 * 
 * Responsabilidades:
 * - Registrar pontos (entrada, saída, pausas)
 * - Validar localização do funcionário
 * - Verificar precisão do GPS
 * - Calcular tempo trabalhado
 * - Enviar confirmações via WhatsApp
 * - Listar histórico de pontos
 */
@Module({
  imports: [WhatsappModule], // Importa módulo do WhatsApp para integração
  controllers: [PontoController], // Controllers com endpoints HTTP
  providers: [PontoService, PrismaService], // Serviços e dependências
})
export class PontoModule {}