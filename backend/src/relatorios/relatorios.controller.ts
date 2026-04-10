import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  Body,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RelatoriosService } from './relatorios.service';
import { Response } from 'express';

/**
 * Controlador de Relatórios (RelatoriosController)
 * 
 * Responsabilidades:
 * - Importar relatórios de entregas (upload de arquivo)
 * - Listar relatórios com filtros
 * - Exportar dados para Excel
 * - Deletar registros de entregas
 * - Gerenciar dados de entregas por arquivo
 * 
 * Endpoints:
 * POST   /admin/relatorios/importar/entregas - Importa arquivo de entregas
 * GET    /admin/relatorios/entregas - Lista entregas com filtros
 * GET    /admin/relatorios/entregas/cidades - Lista cidades únicas
 * DELETE /admin/relatorios/entregas - Deleta todas as entregas
 * DELETE /admin/relatorios/entregas/arquivo - Deleta entregas por arquivo
 * DELETE /admin/relatorios/entregas/arquivos - Deleta múltiplos arquivos
 * DELETE /admin/relatorios/entregas/selecionadas - Deleta entregas específicas
 * POST   /admin/relatorios/entregas/exportar - Exporta para Excel
 */
@Controller('admin/relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  /**
   * Importa relatório de entregas do arquivo enviado
   * Limite de tamanho: 5MB
   * @param file - Arquivo enviado
   * @param usuarioId - ID do usuário que importa (opcional)
   * @returns Resultado da importação
   */
  @Post('importar/entregas')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
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

  /**
   * Lista relatórios de entregas com filtros opcionais
   * @param cidade - Filtrar por cidade
   * @param status - Filtrar por status (ex: pendente, entregue)
   * @param dataInicio - Data inicial para filtro de período
   * @param dataFim - Data final para filtro de período
   * @param busca - Busca por texto em campos específicos
   * @returns Array de entregas filtradas
   */
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

  /**
   * Lista todas as cidades com entregas registradas
   * @returns Array de nomes de cidades únicos
   */
  @Get('entregas/cidades')
  async listarCidadesEntregas() {
    return this.relatoriosService.listarCidadesEntregas();
  }

  /**
   * Deleta TODOS os registros de entregas
   * ⚠️ AÇÃO IRREVERSÍVEL - Use com cuidado
   * @returns Confirmação de deleção
   */
  @Delete('entregas')
  async deletarTodasEntregas() {
    return this.relatoriosService.deletarTodasEntregas();
  }

  /**
   * Deleta todas as entregas de um arquivo específico
   * @param arquivo - Nome do arquivo para deletar
   * @returns Quantidade de entregas deletadas
   */
  @Delete('entregas/arquivo')
  async deletarEntregasPorArquivo(@Query('arquivo') arquivo?: string) {
    return this.relatoriosService.deletarEntregasPorArquivo(arquivo);
  }

  /**
   * Deleta entregas de múltiplos arquivos
   * @param arquivos - Array de nomes de arquivos para deletar
   * @returns Quantidade total de entregas deletadas
   */
  @Delete('entregas/arquivos')
  async deletarMultiplos(@Body('arquivos') arquivos: string[]) {
    return this.relatoriosService.deletarMultiplosArquivos(arquivos);
  }

  /**
   * Deleta entregas específicas selecionadas pelo usuário
   * @param ids - Array de IDs de entregas para deletar
   * @returns Quantidade de entregas deletadas
   */
  @Delete('entregas/selecionadas')
  async deletarEntregasSelecionadas(@Body('ids') ids: string[]) {
    return this.relatoriosService.deletarEntregasSelecionadas(ids);
  }

  /**
   * Exporta entregas para arquivo Excel
   * Pode filtrar por IDs, cidade, status, data ou busca
   * @param body - Filtros e opções de exportação
   * @param res - Objeto Response do Express para enviar o arquivo
   */
  @Post('entregas/exportar')
  async exportarEntregas(
    @Body()
    body: {
      ids?: string[];           // IDs específicos para exportar (se vazio, usa filtros)
      cidade?: string;          // Filtro por cidade
      status?: string;          // Filtro por status
      dataInicio?: string;      // Data inicial
      dataFim?: string;         // Data final
      busca?: string;           // Busca por texto
    },
    @Res() res: Response,
  ) {
    // Chama serviço para gerar arquivo Excel
    const arquivo = await this.relatoriosService.exportarEntregasParaExcel(body);

    // Configura headers para download de arquivo
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${arquivo.nomeArquivo}"`,
    );

    // Envia arquivo para download
    res.send(arquivo.buffer);
  }
}