import { BadRequestException, Injectable } from '@nestjs/common';
import { tipo_registro_ponto } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class PontoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  private formatarDuracao(ms: number): string {
    if (ms <= 0) {
      return '0min';
    }

    const totalMinutos = Math.floor(ms / 1000 / 60);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    if (horas === 0) {
      return `${minutos}min`;
    }

    if (minutos === 0) {
      return `${horas}h`;
    }

    return `${horas}h ${minutos}min`;
  }

  async registrarPonto(funcionarioId: number, tipo: string) {
    try {
      console.log('REGISTRAR PONTO:', { funcionarioId, tipo });

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
        },
      });

      console.log('PONTO SALVO:', resultado);

      const horarioFormatado = new Date(resultado.data_hora).toLocaleString(
        'pt-BR',
        {
          timeZone: 'America/Sao_Paulo',
        },
      );

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
        await this.whatsappService.enviarMensagemRegistroPonto({
          nome: funcionario.usuarios.nome,
          tipo: tipoNormalizado,
          horario: horarioFormatado,
          tempo: tempoTrabalhado,
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