import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { tipo_registro_ponto } from '@prisma/client';

@Injectable()
export class PontoService {
  constructor(private prisma: PrismaService) {}

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

    const resultado = await this.prisma.registros_ponto.create({
      data: {
        funcionario_id: BigInt(funcionarioId),
        tipo: tipoNormalizado,
        data_hora: new Date(),
      },
    });

    console.log('PONTO SALVO:', resultado);

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