import { BadRequestException, Injectable } from '@nestjs/common';
import { tipo_registro_ponto } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

/**
 * Tipo que representa um local permitido para registrar ponto
 * Define as coordenadas e raio de geolocalização aceitos
 */
type LocalPermitido = {
  nome: string;           // Nome descritivo do local
  latitude: number;       // Coordenada de latitude
  longitude: number;      // Coordenada de longitude
  raio: number;          // Raio em metros permitido para registrar ponto
};

/**
 * Serviço de Ponto (PontoService)
 * 
 * Responsabilidades:
 * - Validar localização do funcionário via GPS
 * - Registrar pontos (entrada, saída, pausas)
 * - Calcular tempo trabalhado
 * - Integrar com WhatsApp para confirmação
 * - Listar histórico de pontos
 * 
 * Validações implementadas:
 * 1. Coordenadas geograficamente válidas
 * 2. Precisão do GPS (máximo 100 metros)
 * 3. Localização dentro de raio permitido
 * 4. Tipos de ponto válidos
 */
@Injectable()
export class PontoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  /**
   * Locais permitidos para registrar ponto
   * ⚠️ UPDATE: Troque pelas coordenadas exatas copiadas do pin do Google Maps
   * Coordenadas atuais são exemplos e devem ser configuradas com valores reais
   * Raio padrão: 300 metros
   */
  private readonly locaisPermitidos: LocalPermitido[] = [
    {
      nome: 'Unidade 1 - Rua Abuassali Abujamra, 209',
      latitude: -22.9768652,
      longitude: -49.8795224,
      raio: 300,
    },
    {
      nome: 'Unidade 2 - Rua Amazonas, 530',
      latitude: -22.974029,
      longitude: -49.868587,
      raio: 300,
    },
  ];

  /**
   * Formata duração em milissegundos para formato legível (ex: "8h 30min")
   * @param ms - Duração em milissegundos
   * @returns String formatada com horas e minutos
   */
  private formatarDuracao(ms: number): string {
    // Retorna "0min" para durações negativas ou zeradas
    if (ms <= 0) return '0min';

    // Converte milissegundos para minutos
    const totalMinutos = Math.floor(ms / 1000 / 60);
    // Extrai horas e minutos
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    // Retorna apenas minutos se não houver horas
    if (horas === 0) return `${minutos}min`;
    // Retorna apenas horas se não houver minutos
    if (minutos === 0) return `${horas}h`;

    // Retorna formato completo: "Xh Ymin"
    return `${horas}h ${minutos}min`;
  }

  /**
   * Normaliza e valida uma coordenada geográfica
   * @param valor - Valor da coordenada
   * @param tipo - Tipo: 'latitude' ou 'longitude'
   * @returns Coordenada normalizada com 8 casas decimais
   * @throws BadRequestException - Se coordenada for inválida
   */
  private normalizarCoordenada(valor: number, tipo: 'latitude' | 'longitude'): number {
    // Converte para número
    const numero = Number(valor);

    // Verifica se é um número válido e finito
    if (!Number.isFinite(numero)) {
      throw new BadRequestException(`${tipo} inválida`);
    }

    // Valida intervalo de latitude (-90 a 90 graus)
    if (tipo === 'latitude' && (numero < -90 || numero > 90)) {
      throw new BadRequestException('Latitude fora do intervalo válido');
    }

    // Valida intervalo de longitude (-180 a 180 graus)
    if (tipo === 'longitude' && (numero < -180 || numero > 180)) {
      throw new BadRequestException('Longitude fora do intervalo válido');
    }

    // Retorna coordenada com precisão de 8 casas decimais (~1 metro)
    return Number(numero.toFixed(8));
  }

  /**
   * Valida se latitude e longitude foram informadas e estão corretas
   * @param latitude - Coordenada de latitude
   * @param longitude - Coordenada de longitude
   * @returns Objeto com coordenadas normalizadas
   * @throws BadRequestException - Se coordenadas não forem informadas
   */
  private validarCoordenadas(latitude?: number, longitude?: number) {
    // Verifica se ambas as coordenadas foram fornecidas
    if (latitude == null || longitude == null) {
      throw new BadRequestException('Localização não informada');
    }

    // Normaliza latitude e longitude
    const lat = this.normalizarCoordenada(latitude, 'latitude');
    const lng = this.normalizarCoordenada(longitude, 'longitude');

    return { lat, lng };
  }

  /**
   * Calcula distância entre dois pontos geográficos usando fórmula de Haversine
   * Esta fórmula considera a curvatura da Terra e retorna distância em metros
   * @param lat1 - Latitude do ponto 1
   * @param lon1 - Longitude do ponto 1
   * @param lat2 - Latitude do ponto 2
   * @param lon2 - Longitude do ponto 2
   * @returns Distância em metros
   */
  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Raio da Terra em metros
    const R = 6371000;
    // Função auxiliar para converter graus em radianos
    const toRad = (value: number) => (value * Math.PI) / 180;

    // Diferenças de latitude e longitude em radianos
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    // Fórmula de Haversine - parte 1
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    // Fórmula de Haversine - parte 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Retorna distância em metros
    return R * c;
  }

  /**
   * Encontra o local permitido mais próximo da coordenada fornecida
   * @param latitude - Latitude atual do funcionário
   * @param longitude - Longitude atual do funcionário
   * @returns Objeto com local mais próximo e distância em metros
   */
  private encontrarLocalMaisProximo(latitude: number, longitude: number) {
    // Inicializa variáveis para rastrear o local mais próximo
    let localMaisProximo: LocalPermitido | null = null;
    let menorDistancia = Infinity;

    // Itera sobre todos os locais permitidos
    for (const local of this.locaisPermitidos) {
      // Calcula distância até esse local
      const distancia = this.calcularDistancia(
        latitude,
        longitude,
        local.latitude,
        local.longitude,
      );

      // Se encontrou um local mais próximo, atualiza
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        localMaisProximo = local;
      }
    }

    return {
      local: localMaisProximo,
      distancia: menorDistancia,
    };
  }

  /**
   * Monta URL do Google Maps para as coordenadas fornecidas
   * @param latitude - Latitude para localizar
   * @param longitude - Longitude para localizar
   * @returns URL completa do Google Maps
   */
  private montarLinkMapa(latitude: number, longitude: number) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  /**
   * Registra um ponto (entrada/saída) para um funcionário
   * 
   * Processo:
   * 1. Valida coordenadas geográficas
   * 2. Verifica precisão do GPS
   * 3. Valida tipo de ponto
   * 4. Verifica se está dentro de área permitida
   * 5. Registra no banco de dados
   * 6. Calcula tempo trabalhado
   * 7. Envia notificação WhatsApp
   * 
   * @param funcionarioId - ID do funcionário
   * @param tipo - Tipo de ponto: ENTRADA, SAIDA, SAIDA_ALMOCO, VOLTA_ALMOCO
   * @param latitude - Latitude da localização
   * @param longitude - Longitude da localização
   * @param accuracy - Precisão do GPS em metros
   * @returns Dados do ponto registrado
   * @throws BadRequestException - Para qualquer validação falha
   */
  async registrarPonto(
    funcionarioId: number,
    tipo: string,
    latitude?: number,
    longitude?: number,
    accuracy?: number,
  ) {
    try {
      // Etapa 1: Validar coordenadas
      const { lat, lng } = this.validarCoordenadas(latitude, longitude);
      // Normaliza precisão do GPS para 2 casas decimais, ou null se não fornecida
      const accuracyNormalizada =
        accuracy == null || Number.isNaN(Number(accuracy))
          ? null
          : Number(Number(accuracy).toFixed(2));

      // Log de debug com dados normalizados
      console.log('REGISTRAR PONTO:', {
        funcionarioId,
        tipo,
        latitudeOriginal: latitude,
        longitudeOriginal: longitude,
        latitudeNormalizada: lat,
        longitudeNormalizada: lng,
        accuracy: accuracyNormalizada,
      });

      // Etapa 2: Validar precisão do GPS (máximo 100 metros)
      if (accuracyNormalizada != null && accuracyNormalizada > 100) {
        throw new BadRequestException(
          `Localização imprecisa (${Math.round(accuracyNormalizada)}m). Ative o GPS e tente novamente.`,
        );
      }

      // Etapa 3: Validar tipo de ponto
      const tiposValidos = [
        'ENTRADA',
        'SAIDA_ALMOCO',
        'VOLTA_ALMOCO',
        'SAIDA',
      ] as const;

      // Normaliza tipo para maiúsculas (entrada → ENTRADA)
      const tipoNormalizado = tipo.toUpperCase() as tipo_registro_ponto;

      // Verifica se tipo é válido
      if (!tiposValidos.includes(tipoNormalizado)) {
        throw new BadRequestException('Tipo de ponto inválido');
      }

      // Etapa 4: Verificar localização
      const resultadoLocal = this.encontrarLocalMaisProximo(lat, lng);

      // Verifica se encontrou algum local permitido
      if (!resultadoLocal.local) {
        throw new BadRequestException('Nenhum local permitido foi encontrado');
      }

      // Logs informativos sobre a localização
      console.log('LOCAL MAIS PRÓXIMO:', resultadoLocal.local.nome);
      console.log('DISTÂNCIA ATÉ O LOCAL:', Math.round(resultadoLocal.distancia), 'm');

      // Verifica se está dentro do raio permitido
      if (resultadoLocal.distancia > resultadoLocal.local.raio) {
        throw new BadRequestException(
          `Você está fora da área permitida para registrar ponto. Local mais próximo: ${
            resultadoLocal.local.nome
          } (${Math.round(resultadoLocal.distancia)}m)`,
        );
      }

      // Etapa 5: Buscar dados do funcionário
      const funcionario = await this.prisma.funcionarios.findUnique({
        where: {
          id: BigInt(funcionarioId),
        },
        include: {
          usuarios: true, // Dados do usuário associado
        },
      });

      // Verifica se funcionário existe
      if (!funcionario) {
        throw new BadRequestException('Funcionário não encontrado');
      }

      // Etapa 6: Registrar ponto no banco de dados
      const agora = new Date();

      const resultado = await this.prisma.registros_ponto.create({
        data: {
          funcionario_id: BigInt(funcionarioId),
          tipo: tipoNormalizado,
          data_hora: agora,
          latitude: lat,
          longitude: lng,
          observacao: `Local do ponto: ${resultadoLocal.local.nome}`,
        },
      });

      // Log do ponto salvo com sucesso
      console.log('PONTO SALVO:', resultado);

      // Formata horário para exibição em fuso horário São Paulo
      const horarioFormatado = new Date(resultado.data_hora).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      });

      // Inicializa variável para tempo trabalhado
      let tempoTrabalhado = 'Ainda não calculado';

      // Etapa 7: Calcular tempo trabalhado (apenas para SAIDA)
      if (tipoNormalizado === 'SAIDA') {
        // Busca última entrada anterior a essa saída
        const ultimaEntrada = await this.prisma.registros_ponto.findFirst({
          where: {
            funcionario_id: BigInt(funcionarioId),
            tipo: 'ENTRADA',
            data_hora: {
              lt: resultado.data_hora, // Data anterior à saída
            },
          },
          orderBy: {
            data_hora: 'desc', // Ordena por mais recente primeiro
          },
        });

        if (ultimaEntrada) {
          // Calcula diferença em milissegundos
          const diferencaMs =
            new Date(resultado.data_hora).getTime() -
            new Date(ultimaEntrada.data_hora).getTime();

          // Formata duração no formato legível (ex: "8h 30min")
          tempoTrabalhado = this.formatarDuracao(diferencaMs);
        } else {
          // Se não houver entrada anterior, exibe mensagem
          tempoTrabalhado = 'Sem entrada anterior';
        }
      }

      // Etapa 8: Enviar notificação WhatsApp (opcional)
      try {
        // Monta link do Google Maps com coordenadas
        const linkMapa = this.montarLinkMapa(lat, lng);

        // Envia mensagem de confirmação via WhatsApp
        await this.whatsappService.enviarMensagemRegistroPonto({
          nome: funcionario.usuarios.nome,
          tipo: tipoNormalizado,
          horario: horarioFormatado,
          tempo: tempoTrabalhado,
          local: `${resultadoLocal.local.nome} | ${linkMapa}`,
        });

        // Log de sucesso
        console.log('WHATSAPP ENVIADO COM SUCESSO');
      } catch (erroWhatsapp) {
        // Erro ao enviar WhatsApp não impede registro do ponto
        console.error('ERRO AO ENVIAR WHATSAPP:', erroWhatsapp);
      }

      // Retorna dados do ponto registrado (convertendo BigInt para string)
      return {
        ...resultado,
        id: resultado.id.toString(),
        funcionario_id: resultado.funcionario_id.toString(),
      };
    } catch (error) {
      // Log de erro e re-lança para tratamento no controller
      console.error('ERRO AO REGISTRAR PONTO:', error);
      throw error;
    }
  }

  /**
   * Lista todos os pontos registrados de um funcionário
   * @param funcionarioId - ID do funcionário
   * @returns Array com histórico de pontos ordenado por data (mais recente primeiro)
   */
  async listarPontos(funcionarioId: number) {
    try {
      // Log de debug
      console.log('LISTAR PONTOS:', { funcionarioId });

      // Busca todos os pontos do funcionário, ordenados do mais recente ao mais antigo
      const pontos = await this.prisma.registros_ponto.findMany({
        where: {
          funcionario_id: BigInt(funcionarioId),
        },
        orderBy: {
          data_hora: 'desc',
        },
      });

      // Mapeia resultados convertendo BigInt para string (para compatibilidade JSON)
      return pontos.map((ponto) => ({
        ...ponto,
        id: ponto.id.toString(),
        funcionario_id: ponto.funcionario_id.toString(),
      }));
    } catch (error) {
      // Log de erro
      console.error('ERRO AO LISTAR PONTOS:', error);
      // Re-lança o erro para tratamento no controller
      throw error;
    }
  }
}