import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  async enviarMensagemRegistroPonto(params: {
    nome: string;
    tipo: string;
    horario: string;
    tempo: string;
  }) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const to = process.env.WHATSAPP_MANAGER_PHONE;

    const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;

    console.log('ENVIANDO TEMPLATE PERSONALIZADO...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: 'registro_ponto_alerta',
          language: {
            code: 'pt_BR',
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: params.nome },
                { type: 'text', text: params.tipo },
                { type: 'text', text: params.horario },
                { type: 'text', text: params.tempo },
              ],
            },
          ],
        },
      }),
    });

    const data = await response.json();

    console.log('RESPOSTA WHATSAPP:', data);

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data;
  }
}