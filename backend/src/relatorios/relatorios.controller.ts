import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RelatoriosService } from './relatorios.service';

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
}