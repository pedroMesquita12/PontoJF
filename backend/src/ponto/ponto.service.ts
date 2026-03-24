import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { tipo_registro_ponto } from '@prisma/client';

@Injectable()
export class PontoService {
  constructor(private prisma: PrismaService) {}

  async registrarPonto(funcionarioId: bigint, tipo: string) {
    return this.prisma.registros_ponto.create({
      data: {
        funcionario_id: funcionarioId,
        tipo: tipo as tipo_registro_ponto,
        data_hora: new Date(),
      },
    });
  }

  async listarPontos(funcionarioId: bigint) {
    return this.prisma.registros_ponto.findMany({
      where: {
        funcionario_id: funcionarioId,
      },
      orderBy: {
        data_hora: 'desc',
      },
    });
  }
}
