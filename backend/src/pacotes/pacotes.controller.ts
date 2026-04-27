import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { validarAcessoTelaAdmin } from '../auth/permissions';
import { PacotesService } from './pacotes.service';

type StatusPacote = 'RECEBIDO' | 'EM_ROTA' | 'ENTREGUE' | 'CANCELADO';
type PrioridadePacote = 'NORMAL' | 'URGENTE' | 'EXPRESSA';

@UseGuards(JwtAuthGuard)
@Controller('admin/pacotes')
export class PacotesController {
  constructor(private readonly pacotesService: PacotesService) {}

  @Post('entrada')
  async entradaFuncionario(
    @Req() req: any,
    @Body()
    body: {
      codigo: string;
      destinatario: string;
      endereco: string;
      observacao?: string;
    },
  ) {
    return this.pacotesService.entradaFuncionario(req.user, body);
  }

  @Get()
  async listar(@Req() req: any) {
    validarAcessoTelaAdmin(req.user);
    return this.pacotesService.listar();
  }

  @Post()
  async criar(
    @Req() req: any,
    @Body()
    body: {
      codigo: string;
      destinatario: string;
      endereco: string;
      prioridade?: PrioridadePacote;
      observacao?: string;
    },
  ) {
    validarAcessoTelaAdmin(req.user);
    return this.pacotesService.criar(req.user, body);
  }

  @Post('bipar')
  async bipar(
    @Req() req: any,
    @Body() body: { codigo: string; observacao?: string },
  ) {
    return this.pacotesService.biparPacote(req.user, body);
  }

  @Get('buscar-codigo/:codigo')
  async buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.pacotesService.buscarPorCodigo(codigo);
  }

  @Get(':id/historico')
  async historico(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    validarAcessoTelaAdmin(req.user);
    return this.pacotesService.historico(id);
  }

  @Patch(':id/status')
  async atualizarStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: StatusPacote },
  ) {
    validarAcessoTelaAdmin(req.user);
    return this.pacotesService.atualizarStatus(id, req.user, body.status);
  }

  @Delete(':id')
  async remover(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    validarAcessoTelaAdmin(req.user);
    return this.pacotesService.remover(id);
  }
}