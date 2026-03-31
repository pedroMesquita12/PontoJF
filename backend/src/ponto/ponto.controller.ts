import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { PontoService } from './ponto.service';

@Controller('ponto')
export class PontoController {
  constructor(private readonly pontoService: PontoService) {}

  @Post('registrar')
  registrar(
    @Body()
    body: {
      funcionarioId: number;
      tipo: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    console.log('BODY PONTO:', body);

    const funcionarioId = Number(body.funcionarioId);

    if (!body.tipo || Number.isNaN(funcionarioId)) {
      throw new BadRequestException('funcionarioId ou tipo inválido');
    }

    return this.pontoService.registrarPonto(
      funcionarioId,
      body.tipo,
      body.latitude,
      body.longitude,
    );
  }

  @Get(':funcionarioId')
  listar(@Param('funcionarioId') funcionarioId: string) {
    console.log('PARAM PONTO:', funcionarioId);

    const id = Number(funcionarioId);

    if (Number.isNaN(id)) {
      throw new BadRequestException('funcionarioId inválido');
    }

    return this.pontoService.listarPontos(id);
  }
}