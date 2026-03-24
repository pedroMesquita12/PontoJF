import { Body, Controller, Get, Post } from '@nestjs/common';
import { PontoService } from './ponto.service';

@Controller('ponto')
export class PontoController {
  constructor(private readonly pontoService: PontoService) {}

  @Post('registrar')
  async registrar(@Body() body: any) {
    const { funcionarioId, tipo } = body;

    return this.pontoService.registrarPonto(
      BigInt(funcionarioId),
      tipo,
    );
  }

  @Get(':funcionarioId')
  async listar(@Body() body: any) {
    return this.pontoService.listarPontos(
      BigInt(body.funcionarioId),
    );
  }
}
