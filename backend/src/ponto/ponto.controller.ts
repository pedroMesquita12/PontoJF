import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PontoService } from './ponto.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ponto')
export class PontoController {
  constructor(private readonly pontoService: PontoService) {}

  @Post('registrar')
  registrar(@Body() body: any) {
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

  @UseGuards(JwtAuthGuard)
  @Get('me/atestados/:id/arquivo')
  async gerarLinkAtestado(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pontoService.gerarLinkAtestado(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/horas-extras')
  async obterHorasExtras(@Req() req: any) {
    return this.pontoService.obterHorasExtrasFuncionario(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/advertencias')
  async listarAdvertencias(@Req() req: any) {
    return this.pontoService.listarAdvertenciasFuncionario(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/atestados')
  async listarAtestados(@Req() req: any) {
    return this.pontoService.listarAtestadosFuncionario(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/atestados')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        const allowed = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
        ];

        if (!allowed.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Envie um arquivo PDF, PNG, JPG ou WEBP.'),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
    }),
  )
  async enviarAtestado(
    @Req() req: any,
    @UploadedFile() arquivo: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.pontoService.enviarAtestado(req.user, body, arquivo);
  }

  @Get(':funcionarioId')
  listar(@Param('funcionarioId') funcionarioId: string) {
    const id = Number(funcionarioId);

    if (Number.isNaN(id)) {
      throw new BadRequestException('funcionarioId inválido');
    }

    return this.pontoService.listarPontos(id);
  }
}