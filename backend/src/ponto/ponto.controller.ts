import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PontoService } from './ponto.service';

@Controller('ponto')
export class PontoController {
  constructor(private readonly pontoService: PontoService) {}

  @Post('registrar')
registrar(@Body() body: { funcionarioId: number; tipo: string }) {
  console.log('BODY PONTO:', body);

  const funcionarioId = Number(body.funcionarioId);

  if (!body.tipo || Number.isNaN(funcionarioId)) {
    throw new BadRequestException('funcionarioId ou tipo inválido');
  }

  return this.pontoService.registrarPonto(funcionarioId, body.tipo);
}

  @Get(':funcionarioId')
  listar(@Param('funcionarioId') funcionarioId: string) {
    console.log('PARAM PONTO:', funcionarioId);

    return this.pontoService.listarPontos(Number(funcionarioId));
  }
}