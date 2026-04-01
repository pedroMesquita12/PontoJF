import { BadRequestException, Injectable } from '@nestjs/common';
import { tipo_registro_ponto } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

type LocalPermitido = {
  nome: string;
  latitude: number;
  longitude: number;
  raio: number;
};

@Injectable()
export class PontoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  // Troque pelas coordenadas exatas copiadas do pin do Google Maps.
  // Não preenchi coordenadas novas aqui para não inventar valores.
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

  private formatarDuracao(ms: number): string {
    if (ms <= 0) return '0min';

    const totalMinutos = Math.floor(ms / 1000 / 60);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;

    return `${horas}h ${minutos}min`;
  }

  private normalizarCoordenada(valor: number, tipo: 'latitude' | 'longitude'): number {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      throw new BadRequestException(`${tipo} inválida`);
    }

    if (tipo === 'latitude' && (numero < -90 || numero > 90)) {
      throw new BadRequestException('Latitude fora do intervalo válido');
    }

    if (tipo === 'longitude' && (numero < -180 || numero > 180)) {
      throw new BadRequestException('Longitude fora do intervalo válido');
    }

    return Number(numero.toFixed(8));
  }

  private validarCoordenadas(latitude?: number, longitude?: number) {
    if (latitude == null || longitude == null) {
      throw new BadRequestException('Localização não informada');
    }

    const lat = this.normalizarCoordenada(latitude, 'latitude');
    const lng = this.normalizarCoordenada(longitude, 'longitude');

    return { lat, lng };
  }

  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private encontrarLocalMaisProximo(latitude: number, longitude: number) {
    let localMaisProximo: LocalPermitido | null = null;
    let menorDistancia = Infinity;

    for (const local of this.locaisPermitidos) {
      const distancia = this.calcularDistancia(
        latitude,
        longitude,
        local.latitude,
        local.longitude,
      );

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

  private montarLinkMapa(latitude: number, longitude: number) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  async registrarPonto(
    funcionarioId: number,
    tipo: string,
    latitude?: number,
    longitude?: number,
    accuracy?: number,
  ) {
    try {
      const { lat, lng } = this.validarCoordenadas(latitude, longitude);
      const accuracyNormalizada =
        accuracy == null || Number.isNaN(Number(accuracy))
          ? null
          : Number(Number(accuracy).toFixed(2));

      console.log('REGISTRAR PONTO:', {
        funcionarioId,
        tipo,
        latitudeOriginal: latitude,
        longitudeOriginal: longitude,
        latitudeNormalizada: lat,
        longitudeNormalizada: lng,
        accuracy: accuracyNormalizada,
      });

      if (accuracyNormalizada != null && accuracyNormalizada > 100) {
        throw new BadRequestException(
          `Localização imprecisa (${Math.round(accuracyNormalizada)}m). Ative o GPS e tente novamente.`,
        );
      }

      const tiposValidos = [
        'ENTRADA',
        'SAIDA_ALMOCO',
        'VOLTA_ALMOCO',
        'SAIDA',
      ] as const;

      const tipoNormalizado = tipo.toUpperCase() as tipo_registro_ponto;

      if (!tiposValidos.includes(tipoNormalizado)) {
        throw new BadRequestException('Tipo de ponto inválido');
      }

      const resultadoLocal = this.encontrarLocalMaisProximo(lat, lng);

      if (!resultadoLocal.local) {
        throw new BadRequestException('Nenhum local permitido foi encontrado');
      }

      console.log('LOCAL MAIS PRÓXIMO:', resultadoLocal.local.nome);
      console.log('DISTÂNCIA ATÉ O LOCAL:', Math.round(resultadoLocal.distancia), 'm');

      if (resultadoLocal.distancia > resultadoLocal.local.raio) {
        throw new BadRequestException(
          `Você está fora da área permitida para registrar ponto. Local mais próximo: ${
            resultadoLocal.local.nome
          } (${Math.round(resultadoLocal.distancia)}m)`,
        );
      }

      const funcionario = await this.prisma.funcionarios.findUnique({
        where: {
          id: BigInt(funcionarioId),
        },
        include: {
          usuarios: true,
        },
      });

      if (!funcionario) {
        throw new BadRequestException('Funcionário não encontrado');
      }

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

      console.log('PONTO SALVO:', resultado);

      const horarioFormatado = new Date(resultado.data_hora).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      });

      let tempoTrabalhado = 'Ainda não calculado';

      if (tipoNormalizado === 'SAIDA') {
        const ultimaEntrada = await this.prisma.registros_ponto.findFirst({
          where: {
            funcionario_id: BigInt(funcionarioId),
            tipo: 'ENTRADA',
            data_hora: {
              lt: resultado.data_hora,
            },
          },
          orderBy: {
            data_hora: 'desc',
          },
        });

        if (ultimaEntrada) {
          const diferencaMs =
            new Date(resultado.data_hora).getTime() -
            new Date(ultimaEntrada.data_hora).getTime();

          tempoTrabalhado = this.formatarDuracao(diferencaMs);
        } else {
          tempoTrabalhado = 'Sem entrada anterior';
        }
      }

      try {
        const linkMapa = this.montarLinkMapa(lat, lng);

        await this.whatsappService.enviarMensagemRegistroPonto({
          nome: funcionario.usuarios.nome,
          tipo: tipoNormalizado,
          horario: horarioFormatado,
          tempo: tempoTrabalhado,
          local: `${resultadoLocal.local.nome} | ${linkMapa}`,
        });

        console.log('WHATSAPP ENVIADO COM SUCESSO');
      } catch (erroWhatsapp) {
        console.error('ERRO AO ENVIAR WHATSAPP:', erroWhatsapp);
      }

      return {
        ...resultado,
        id: resultado.id.toString(),
        funcionario_id: resultado.funcionario_id.toString(),
      };
    } catch (error) {
      console.error('ERRO AO REGISTRAR PONTO:', error);
      throw error;
    }
  }

  async listarPontos(funcionarioId: number) {
    try {
      console.log('LISTAR PONTOS:', { funcionarioId });

      const pontos = await this.prisma.registros_ponto.findMany({
        where: {
          funcionario_id: BigInt(funcionarioId),
        },
        orderBy: {
          data_hora: 'desc',
        },
      });

      return pontos.map((ponto) => ({
        ...ponto,
        id: ponto.id.toString(),
        funcionario_id: ponto.funcionario_id.toString(),
      }));
    } catch (error) {
      console.error('ERRO AO LISTAR PONTOS:', error);
      throw error;
    }
  }
}