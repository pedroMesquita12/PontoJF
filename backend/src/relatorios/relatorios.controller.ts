import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { RelatoriosService } from './relatorios.service';
import { MatriculaGuard } from '../common/guards/matricula.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, MatriculaGuard)
@Controller('admin/relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Post('importar/entregas')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async importarRelatorioEntregas(
    @UploadedFile() file: any,
    @Query('usuarioId') usuarioId?: string,
  ) {
    return this.relatoriosService.importarRelatorioEntregas(
      file,
      usuarioId ? BigInt(usuarioId) : undefined,
    );
  }

  @Get('entregas')
  async listarRelatoriosEntregas(
    @Query('cidade') cidade?: string,
    @Query('status') status?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('busca') busca?: string,
  ) {
    return this.relatoriosService.listarRelatoriosEntregas({
      cidade,
      status,
      dataInicio,
      dataFim,
      busca,
    });
  }

  @Get('entregas/cidades')
  async listarCidadesEntregas() {
    return this.relatoriosService.listarCidadesEntregas();
  }

  @Delete('entregas')
  async deletarTodasEntregas() {
    return this.relatoriosService.deletarTodasEntregas();
  }

  @Delete('entregas/arquivo')
  async deletarEntregasPorArquivo(@Query('arquivo') arquivo?: string) {
    return this.relatoriosService.deletarEntregasPorArquivo(arquivo);
  }

  @Delete('entregas/arquivos')
  async deletarMultiplos(@Body('arquivos') arquivos: string[]) {
    return this.relatoriosService.deletarMultiplosArquivos(arquivos);
  }

  @Delete('entregas/selecionadas')
  async deletarEntregasSelecionadas(@Body('ids') ids: string[]) {
    return this.relatoriosService.deletarEntregasSelecionadas(ids);
  }

  @Post('entregas/exportar')
  async exportarEntregas(
    @Body()
    body: {
      ids?: string[];
      cidade?: string;
      status?: string;
      dataInicio?: string;
      dataFim?: string;
      busca?: string;
    },
    @Res() res: Response,
  ) {
    const arquivo = await this.relatoriosService.exportarEntregasParaExcel(body);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${arquivo.nomeArquivo}"`,
    );

    res.send(arquivo.buffer);
  }
}