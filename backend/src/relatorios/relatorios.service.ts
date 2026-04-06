import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Prisma,
  status_entrega_relatorio,
  tipo_relatorio,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';
import * as iconv from 'iconv-lite';

type FiltrosEntregas = {
  cidade?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
};

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async importarRelatorioEntregas(file: any, usuarioId?: bigint) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    const originalName = this.corrigirTexto(file.originalname || '');
    const lowerName = originalName.toLowerCase();

    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.csv')) {
      throw new BadRequestException('Apenas arquivos .xlsx ou .csv são permitidos.');
    }

    const rows = lowerName.endsWith('.csv')
      ? this.extrairLinhasDoCsv(file.buffer)
      : await this.extrairLinhasDoXlsx(file.buffer);

    if (!rows.length) {
      throw new BadRequestException('Nenhum dado encontrado no arquivo.');
    }

    const importacao = await this.prisma.importacoes_relatorios.create({
      data: {
        nome_arquivo: originalName,
        tipo_relatorio: tipo_relatorio.ENTREGAS,
        importado_por: usuarioId,
      },
    });

    const registros = rows
      .map((row) => this.mapearLinhaEntrega(row, originalName, importacao.id))
      .filter(Boolean) as Prisma.relatorios_entregasCreateManyInput[];

    if (!registros.length) {
      throw new BadRequestException(
        'Nenhum registro válido de entrega foi identificado no arquivo.',
      );
    }

    await this.prisma.relatorios_entregas.createMany({
      data: registros,
    });

    return {
      message: 'Relatório importado com sucesso.',
      importacaoId: importacao.id.toString(),
      arquivo: originalName,
      totalImportado: registros.length,
    };
  }

  async listarRelatoriosEntregas(filters: FiltrosEntregas) {
    const where: Prisma.relatorios_entregasWhereInput = {};

    if (filters.cidade) {
      where.cidade = {
        equals: filters.cidade,
        mode: 'insensitive',
      };
    }

    if (filters.status) {
      where.status = filters.status as status_entrega_relatorio;
    }

    if (filters.dataInicio || filters.dataFim) {
      where.data_entrega = {};

      if (filters.dataInicio) {
        where.data_entrega.gte = new Date(`${filters.dataInicio}T00:00:00`);
      }

      if (filters.dataFim) {
        where.data_entrega.lte = new Date(`${filters.dataFim}T23:59:59`);
      }
    }

    if (filters.busca) {
      where.OR = [
        {
          codigo_entrega: {
            contains: filters.busca,
            mode: 'insensitive',
          },
        },
        {
          endereco: {
            contains: filters.busca,
            mode: 'insensitive',
          },
        },
        {
          cidade: {
            contains: filters.busca,
            mode: 'insensitive',
          },
        },
        {
          entregador_nome: {
            contains: filters.busca,
            mode: 'insensitive',
          },
        },
        {
          entregador_telefone: {
            contains: filters.busca,
            mode: 'insensitive',
          },
        },
        {
          origem_arquivo: {
            contains: filters.busca,
            mode: 'insensitive',
          },
        },
      ];
    }

    const entregas = await this.prisma.relatorios_entregas.findMany({
      where,
      orderBy: [{ data_entrega: 'desc' }, { id: 'desc' }],
    });

    const totalEntregas = entregas.length;
    const entregues = entregas.filter((e) => e.status === 'ENTREGUE').length;
    const emRota = entregas.filter((e) => e.status === 'EM_ROTA').length;
    const pendentes = entregas.filter((e) => e.status === 'PENDENTE').length;
    const canceladas = entregas.filter((e) => e.status === 'CANCELADO').length;

    return {
      stats: {
        totalEntregas,
        entregues,
        emRota,
        pendentes,
        canceladas,
      },
      entregas: entregas.map((item) => ({
        id: item.id.toString(),
        codigo: item.codigo_entrega,
        endereco: item.endereco,
        cidade: item.cidade,
        dataEntrega: item.data_entrega,
        status: item.status,
        valorEntrega: item.valor_entrega,
        entregadorNome: item.entregador_nome,
        entregadorTelefone: item.entregador_telefone,
        origemArquivo: item.origem_arquivo,
      })),
    };
  }
  
  async listarCidadesEntregas() {
    const cidades = await this.prisma.relatorios_entregas.findMany({
      where: {
        cidade: {
          not: null,
        },
      },
      select: {
        cidade: true,
      },
      distinct: ['cidade'],
      orderBy: {
        cidade: 'asc',
      },
    });

    return cidades
      .map((item) => item.cidade)
      .filter((cidade): cidade is string => Boolean(cidade));
  }

  private async extrairLinhasDoXlsx(
  buffer: Buffer | Uint8Array,
): Promise<Record<string, any>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new BadRequestException('A planilha não possui abas válidas.');
  }

  const linhas: any[][] = [];

  worksheet.eachRow((row) => {
    const valores = Array.isArray(row.values) ? row.values.slice(1) : [];
    linhas.push(valores.map((cell) => this.corrigirValor(cell)));
  });

  const headerIndex = this.encontrarLinhaCabecalho(linhas);

  if (headerIndex === -1) {
    throw new BadRequestException(
      'Não foi possível localizar o cabeçalho da planilha.',
    );
  }

  const headers = linhas[headerIndex].map((cell) =>
    this.normalizarCabecalho(cell),
  );

  const dataRows = linhas.slice(headerIndex + 1);

  return dataRows
    .map((row) => {
      const obj: Record<string, any> = {};

      headers.forEach((header, index) => {
        if (!header) return;
        obj[header] = row[index] ?? null;
      });

      return obj;
    })
    .filter((row) =>
      Object.values(row).some(
        (value) => value !== null && String(value).trim() !== '',
      ),
    );
}

  private extrairLinhasDoCsv(buffer: Buffer | Uint8Array): Record<string, any>[] {
    const texto = this.decodeCsv(buffer);
    const delimiter = this.detectarDelimitador(texto);

    const records = parse(texto, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      delimiter,
      trim: true,
      relax_column_count: true,
    }) as Record<string, any>[];

    return records
      .map((row) => {
        const obj: Record<string, any> = {};

        Object.entries(row).forEach(([key, value]) => {
          obj[this.normalizarCabecalho(key)] = this.corrigirValor(value);
        });

        return obj;
      })
      .filter((row) =>
        Object.values(row).some(
          (value) => value !== null && String(value).trim() !== '',
        ),
      );
  }

  private detectarDelimitador(texto: string): string {
    const primeiraLinha = texto.split(/\r?\n/).find((line) => line.trim()) || '';
    const qtdPontoVirgula = (primeiraLinha.match(/;/g) || []).length;
    const qtdVirgula = (primeiraLinha.match(/,/g) || []).length;
    return qtdPontoVirgula >= qtdVirgula ? ';' : ',';
  }

  private decodeCsv(buffer: Buffer | Uint8Array): string {
  const safeBuffer = Buffer.from(buffer as any);
  const utf8 = iconv.decode(safeBuffer, 'utf8');

  if (this.temMojibake(utf8)) {
    return iconv.decode(safeBuffer, 'latin1');
  }

  return utf8;
}

  private temMojibake(texto: string): boolean {
    return /Ã|Â|�/.test(texto);
  }

  private encontrarLinhaCabecalho(linhas: any[][]): number {
    const aliases = [
      'nº os',
      'no os',
      'numero os',
      'codigo',
      'código',
      'status',
      'entregador',
      'telefone do entregador',
      'cidade da entrega 1',
      'endereco da entrega 1',
      'endereço da entrega 1',
      'valor da solicitacao',
      'valor da solicitação',
    ];

    for (let i = 0; i < linhas.length; i++) {
      const linhaNormalizada = (linhas[i] || []).map((cell) =>
        this.normalizarCabecalho(cell),
      );

      const encontrou = aliases.some((alias) =>
        linhaNormalizada.includes(this.normalizarCabecalho(alias)),
      );

      if (encontrou) {
        return i;
      }
    }

    return -1;
  }

  private mapearLinhaEntrega(
    row: Record<string, any>,
    nomeArquivo: string,
    importacaoId: bigint,
  ): Prisma.relatorios_entregasCreateManyInput | null {
    const codigoEntrega =
      this.getValue(row, [
        'nº os',
        'no os',
        'numero os',
        'id da entrega',
        'codigo',
        'código',
      ]) ?? null;

    const statusRaw = this.getValue(row, ['status']) ?? null;

    const dataEntregaRaw =
      this.getValue(row, [
        'momento que o entregador registrou o encerramento',
        'momento do aceite',
        'momento da solicitacao',
        'momento da solicitação',
        'data da entrega',
        'data entrega',
        'data',
      ]) ?? null;

    const endereco =
      this.getValue(row, [
        'endereco da entrega 1',
        'endereço da entrega 1',
        'endereco',
        'endereço',
        'logradouro',
      ]) ?? null;

    const cidade =
      this.getValue(row, [
        'cidade da entrega 1',
        'cidade',
        'municipio',
        'município',
      ]) ||
      this.extrairCidadeDoEndereco(endereco) ||
      this.extrairCidadeDoNomeArquivo(nomeArquivo) ||
      null;

    const valorRaw =
      this.getValue(row, [
        'valor da solicitacao',
        'valor da solicitação',
        'valor da entrega',
        'valor',
      ]) ?? null;

    const entregadorNome = this.getValue(row, ['entregador']) ?? null;

    const entregadorTelefone =
      this.getValue(row, ['telefone do entregador']) ?? null;

    const status = this.normalizarStatusEntrega(statusRaw);
    const dataEntrega = this.parseExcelDateTime(dataEntregaRaw);
    const valorEntrega = this.parseDecimal(valorRaw);

    const existeConteudoMinimo =
      codigoEntrega || endereco || cidade || entregadorNome;

    if (!existeConteudoMinimo) {
      return null;
    }

    return {
      importacao_id: importacaoId,
      codigo_entrega: codigoEntrega ? String(codigoEntrega).trim() : null,
      endereco: endereco ? this.corrigirTexto(String(endereco).trim()) : null,
      cidade: cidade ? this.corrigirTexto(String(cidade).trim()) : null,
      data_entrega: dataEntrega,
      status,
      valor_entrega: valorEntrega,
      entregador_nome: entregadorNome
        ? this.corrigirTexto(String(entregadorNome).trim())
        : null,
      entregador_telefone: entregadorTelefone
        ? this.corrigirTexto(String(entregadorTelefone).trim())
        : null,
      origem_arquivo: this.corrigirTexto(nomeArquivo),
    };
  }

  private getValue(row: Record<string, any>, keys: string[]) {
    for (const key of keys) {
      if (
        row[key] !== undefined &&
        row[key] !== null &&
        String(row[key]).trim() !== ''
      ) {
        return this.corrigirValor(row[key]);
      }
    }

    return null;
  }

  private corrigirValor(value: any): any {
    if (value === null || value === undefined) return value;
    if (value instanceof Date || typeof value === 'number') return value;
    return this.corrigirTexto(String(value));
  }

  private corrigirTexto(texto: string): string {
    if (!texto) return '';

    let resultado = texto.trim();

    if (this.temMojibake(resultado)) {
      try {
        resultado = Buffer.from(resultado, 'latin1').toString('utf8');
      } catch {
        // mantém o texto original se falhar
      }
    }

    return resultado
      .replace(/\s+/g, ' ')
      .replace(/ServiA§os/g, 'Serviços')
      .replace(/MarA§o/g, 'Março')
      .replace(/ChapecA3/g, 'Chapecó')
      .replace(/SolicitaA§A£o/g, 'Solicitação')
      .trim();
  }

  private normalizarCabecalho(value: any): string {
    if (value === null || value === undefined) return '';

    return this.corrigirTexto(String(value))
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private normalizarStatusEntrega(value: any): status_entrega_relatorio | null {
    if (!value) return null;

    const normalized = this.corrigirTexto(String(value))
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (
      normalized.includes('ENTREGUE') ||
      normalized.includes('FINALIZADO') ||
      normalized.includes('CONCLUIDO')
    ) {
      return 'ENTREGUE';
    }

    if (
      normalized.includes('ROTA') ||
      normalized.includes('EM ANDAMENTO') ||
      normalized.includes('EM TRANSITO')
    ) {
      return 'EM_ROTA';
    }

    if (normalized.includes('PENDENTE') || normalized.includes('AGUARDANDO')) {
      return 'PENDENTE';
    }

    if (
      normalized.includes('CANCEL') ||
      normalized.includes('RECUS') ||
      normalized.includes('FALHA')
    ) {
      return 'CANCELADO';
    }

    return null;
  }

  private extrairCidadeDoNomeArquivo(nomeArquivo: string): string | null {
    const nome = this.corrigirTexto(nomeArquivo)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (nome.includes('ourinhos')) return 'Ourinhos';
    if (nome.includes('chapeco')) return 'Chapecó';

    return null;
  }

  private extrairCidadeDoEndereco(endereco?: string | null): string | null {
    if (!endereco) return null;

    const texto = this.corrigirTexto(endereco)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (texto.includes('ourinhos')) return 'Ourinhos';
    if (texto.includes('chapeco')) return 'Chapecó';

    return null;
  }

  private parseExcelDateTime(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number') {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(excelEpoch.getTime() + value * 86400000);
    }

    const texto = this.corrigirTexto(String(value)).trim();

    if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(:\d{2})?$/.test(texto)) {
      const [data, hora] = texto.split(/\s+/);
      const [dia, mes, ano] = data.split('/');
      const horaCompleta = hora.length === 5 ? `${hora}:00` : hora;
      return new Date(`${ano}-${mes}-${dia}T${horaCompleta}`);
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
      const [dia, mes, ano] = texto.split('/');
      return new Date(`${ano}-${mes}-${dia}T00:00:00`);
    }

    const parsed = new Date(texto);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private parseDecimal(value: any): Prisma.Decimal | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number') {
      return new Prisma.Decimal(value);
    }

    const texto = this.corrigirTexto(String(value))
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '');

    if (!texto) return null;

    const numero = Number(texto);

    if (Number.isNaN(numero)) {
      return null;
    }

    return new Prisma.Decimal(numero);
  }

  async deletarTodasEntregas() {
  const total = await this.prisma.relatorios_entregas.count();

  await this.prisma.relatorios_entregas.deleteMany({});

  return {
    message: 'Todos os dados das planilhas foram removidos com sucesso.',
    totalRemovido: total,
  };
}
async deletarEntregasPorArquivo(arquivo?: string) {
  if (!arquivo || !arquivo.trim()) {
    throw new BadRequestException('Nome do arquivo não informado.');
  }

  const nomeArquivo = this.corrigirTexto(arquivo.trim());

  const total = await this.prisma.relatorios_entregas.count({
    where: {
      origem_arquivo: nomeArquivo,
    },
  });

  if (total === 0) {
    throw new BadRequestException(
      'Nenhum registro foi encontrado para o arquivo informado.',
    );
  }

  await this.prisma.relatorios_entregas.deleteMany({
    where: {
      origem_arquivo: nomeArquivo,
    },
  });

  return {
    message: 'Dados do arquivo removidos com sucesso.',
    arquivo: nomeArquivo,
    totalRemovido: total,
  };
}
async deletarMultiplosArquivos(arquivos: string[]) {
  if (!arquivos || arquivos.length === 0) {
    throw new BadRequestException('Nenhum arquivo informado.');
  }

  const nomes = arquivos.map((a) => this.corrigirTexto(a.trim()));

  const total = await this.prisma.relatorios_entregas.count({
    where: {
      origem_arquivo: {
        in: nomes,
      },
    },
  });

  await this.prisma.relatorios_entregas.deleteMany({
    where: {
      origem_arquivo: {
        in: nomes,
      },
    },
  });

  return {
    message: 'Arquivos selecionados removidos com sucesso.',
    arquivos: nomes,
    totalRemovido: total,
  };
}
async deletarEntregasSelecionadas(ids: string[]) {
  if (!ids || ids.length === 0) {
    throw new BadRequestException('Nenhum registro informado.');
  }

  const idsConvertidos = ids.map((id) => BigInt(id));

  const total = await this.prisma.relatorios_entregas.count({
    where: {
      id: {
        in: idsConvertidos,
      },
    },
  });

  if (total === 0) {
    throw new BadRequestException(
      'Nenhum registro foi encontrado para os IDs informados.',
    );
  }

  await this.prisma.relatorios_entregas.deleteMany({
    where: {
      id: {
        in: idsConvertidos,
      },
    },
  });

  return {
    message: 'Registros selecionados removidos com sucesso.',
    totalRemovido: total,
  };
}
}