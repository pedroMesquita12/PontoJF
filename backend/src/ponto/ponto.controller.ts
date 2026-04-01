import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { PontoService } from './ponto.service';

type RegistrarPontoBody = {
  funcionarioId: number | string;
  tipo: string;
  latitude?: number | string;
  longitude?: number | string;
  accuracy?: number | string;
};

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
    accuracy?: number;
  },
) {
  console.log('=== POST /ponto/registrar ===');
  console.log('BODY PONTO:', body);

  const funcionarioId = Number(body.funcionarioId);
  const latitude = body.latitude != null ? Number(body.latitude) : undefined;
  const longitude = body.longitude != null ? Number(body.longitude) : undefined;
  const accuracy = body.accuracy != null ? Number(body.accuracy) : undefined;

  if (!body.tipo || Number.isNaN(funcionarioId)) {
    throw new BadRequestException('funcionarioId ou tipo inválido');
  }

  return this.pontoService.registrarPonto(
    funcionarioId,
    body.tipo,
    latitude,
    longitude,
    accuracy,
  );
}

@Get(':funcionarioId')
listar(@Param('funcionarioId') funcionarioId: string) {
  console.log('=== GET /ponto/:funcionarioId ===');
  console.log('PARAM PONTO:', funcionarioId);

  const id = Number(funcionarioId);

  if (Number.isNaN(id)) {
    throw new BadRequestException('funcionarioId inválido');
  }

  return this.pontoService.listarPontos(id);
}

}