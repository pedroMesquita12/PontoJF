import { Injectable } from '@nestjs/common';

/**
 * Parâmetros para enviar mensagem de registro de ponto via WhatsApp
 */
type RegistroPontoParams = {
  nome: string;         // Nome do funcionário
  tipo: string;         // Tipo de ponto (ENTRADA, SAIDA, etc)
  horario: string;      // Horário formatado
  tempo: string;        // Tempo trabalhado (ex: "8h 30min")
  local: string;        // Local com link de Google Maps
};

/**
 * Serviço de WhatsApp (WhatsappService)
 * 
 * Responsabilidades:
 * - Enviar notificações de ponto registrado
 * - Integrar com WhatsApp Cloud API do Meta
 * - Usar templates pré-aprovados
 * - Falhas não interrompem o fluxo (non-blocking)
 * 
 * Configurações necessárias (.env):
 * - WHATSAPP_TOKEN: Token de acesso ao WhatsApp Cloud API
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número de telefone
 * - WHATSAPP_MANAGER_PHONE: Telefone do gerente para receber notificações
 */
@Injectable()
export class WhatsappService {
  /**
   * Envia notificação de registro de ponto via WhatsApp
   * 
   * Utiliza template personalizado "registro_ponto_alerta"
   * A mensagem é enviada para o gerente informando:
   * - Nome do funcionário
   * - Tipo de ponto registrado
   * - Horário exato
   * - Tempo trabalhado (se saída)
   * - Local com link do Google Maps
   * 
   * @param params - Dados do registro de ponto
   * @throws Error - Se falhar ao enviar (não interrompe fluxo anterior)
   */
  async enviarMensagemRegistroPonto(params: {
    nome: string;
    tipo: string;
    horario: string;
    tempo: string;
    local: string; // Local com link de mapa
  }) {
    // Obtém credenciais do arquivo .env
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const to = process.env.WHATSAPP_MANAGER_PHONE;

    // Monta URL da API do WhatsApp Cloud
    const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;

    // Log de debug
    console.log('ENVIANDO TEMPLATE PERSONALIZADO...');

    // Faz requisição para API do WhatsApp
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to, // Telefone do gerente
        type: 'template',
        template: {
          name: 'registro_ponto_alerta', // Template pré-aprovado
          language: {
            code: 'pt_BR',
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: params.nome }, // 1. Nome
                { type: 'text', text: params.tipo }, // 2. Tipo (ENTRADA, SAIDA, etc)
                { type: 'text', text: params.horario }, // 3. Horário
                { type: 'text', text: params.tempo }, // 4. Tempo trabalhado
                { type: 'text', text: params.local }, // 5. Local com link
              ],
            },
          ],
        },
      }),
    });

    // Parseia resposta da API
    const data = await response.json();

    // Log de resposta
    console.log('RESPOSTA WHATSAPP:', data);

    // Verifica se houve erro na resposta
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data;
  }
}