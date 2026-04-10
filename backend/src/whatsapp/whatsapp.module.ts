import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

/**
 * Módulo WhatsApp (WhatsappModule)
 * 
 * Organiza componentes para integração com WhatsApp:
 * - Services: Lógica de envio de mensagens
 * - Exports: Disponibiliza WhatsappService para outros módulos
 * 
 * Responsabilidades:
 * - Enviar notificações de ponto registrado
 * - Integrar com WhatsApp Cloud API do Meta
 * - Usar templates pré-aprovados
 * 
 * Uso em outros módulos:
 * imports: [WhatsappModule]
 * E após isso, injetar: constructor(private whatsappService: WhatsappService)
 */
@Module({
  providers: [WhatsappService], // Serviço WhatsApp
  exports: [WhatsappService], // Exporta para ser usado em outros módulos
})
export class WhatsappModule {}