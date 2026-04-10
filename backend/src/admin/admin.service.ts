import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Tipos de registro de ponto
 */
type TipoRegistro = 'ENTRADA' | 'SAIDA' | 'SAIDA_ALMOCO' | 'VOLTA_ALMOCO';

/**
 * Status do funcionário em tempo real
 */
type StatusFuncionario = 'trabalhando' | 'pausa' | 'fora';

/**
 * Tipo para registro de ponto do banco de dados
 */
type RegistroPonto = {
  id: bigint;
  funcionario_id: bigint;
  tipo: TipoRegistro;
  data_hora: Date;
  data_referencia: Date;
};

/**
 * Serviço Administrativo (AdminService)
 * 
 * Responsabilidades:
 * - Listar funcionários com status de ponto
 * - Calcular resumo de pontos (diário, semanal, mensal)
 * - Gerar relatório overview para dashboard
 * - Calcular tempo trabalhado por funcionário
 * - Mapear tipos de ponto para formato UI
 * - Formatar datas/horas para fuso horário brasileiro
 */
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retorna início do dia (00:00:00)
   * @param dateString - Data no formato YYYY-MM-DD
   * @returns Date com horário às 00:00:00
   */
  private getStartOfDay(dateString: string) {
    return new Date(`${dateString}T00:00:00`);
  }

  /**
   * Retorna fim do dia (23:59:59.999)
   * @param dateString - Data no formato YYYY-MM-DD
   * @returns Date com horário às 23:59:59
   */
  private getEndOfDay(dateString: string) {
    return new Date(`${dateString}T23:59:59.999`);
  }

  /**
   * Calcula início da semana (segunda-feira)
   * @param date - Data de referência
   * @returns Date do primeiro dia da semana (segunda) às 00:00:00
   */
  private getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 domingo, 1 segunda...
    const diff = day === 0 ? -6 : 1 - day; // semana começando na segunda
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Calcula fim da semana (domingo)
   * @param date - Data de referência
   * @returns Date do último dia da semana (domingo) às 23:59:59
   */
  private getEndOfWeek(date: Date) {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  /**
   * Formata minutos para formato legível (HHh MMmin)
   * @param totalMinutes - Total de minutos
   * @returns String formatada (ex: "08h 30min")
   */
  private formatMinutes(totalMinutes: number) {
    const safe = Math.max(0, Math.floor(totalMinutes));
    const hours = Math.floor(safe / 60);
    const minutes = safe % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min`;
  }

  /**
   * Calcula diferença entre duas datas em minutos
   * @param start - Data inicial
   * @param end - Data final
   * @returns Diferença em minutos (mínimo 0)
   */
  private diffInMinutes(start: Date, end: Date) {
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  }

  /**
   * Mapeia tipo de ponto para formato de exibição UI
   * @param tipo - Tipo de ponto (ENTRADA, SAIDA, etc)
   * @returns String formatada para UI
   */
  private mapTipo(tipo: TipoRegistro) {
    switch (tipo) {
      case 'ENTRADA':
        return 'entrada';
      case 'SAIDA':
        return 'saida';
      case 'SAIDA_ALMOCO':
        return 'pausa_inicio';
      case 'VOLTA_ALMOCO':
        return 'pausa_fim';
      default:
        return 'entrada';
    }
  }

  /**
   * Formata data/hora para exibição em fuso horário de São Paulo
   * @param date - Data a formatar
   * @returns String com horário formatado (HH:mm)
   */
  private formatTime(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  }

  private calcularResumo(registros: RegistroPonto[]) {
    if (!registros.length) {
      return {
        status: 'fora' as StatusFuncionario,
        horasTrabalhadas: 0,
        horasPausa: 0,
        ultimaEntrada: '-',
        ultimaSaida: '-',
      };
    }

    let trabalhoMin = 0;
    let pausaMin = 0;

    let inicioTrabalho: Date | null = null;
    let inicioPausa: Date | null = null;

    let ultimaEntrada = '-';
    let ultimaSaida = '-';

    for (const registro of registros) {
      const dataHora = registro.data_hora;

      switch (registro.tipo) {
        case 'ENTRADA':
          inicioTrabalho = dataHora;
          ultimaEntrada = this.formatTime(dataHora);
          break;

        case 'SAIDA_ALMOCO':
          if (inicioTrabalho) {
            trabalhoMin += this.diffInMinutes(inicioTrabalho, dataHora);
            inicioTrabalho = null;
          }
          inicioPausa = dataHora;
          ultimaSaida = this.formatTime(dataHora);
          break;

        case 'VOLTA_ALMOCO':
          if (inicioPausa) {
            pausaMin += this.diffInMinutes(inicioPausa, dataHora);
            inicioPausa = null;
          }
          inicioTrabalho = dataHora;
          ultimaEntrada = this.formatTime(dataHora);
          break;

        case 'SAIDA':
          if (inicioTrabalho) {
            trabalhoMin += this.diffInMinutes(inicioTrabalho, dataHora);
            inicioTrabalho = null;
          }
          ultimaSaida = this.formatTime(dataHora);
          break;
      }
    }

    const ultimoRegistro = registros[registros.length - 1];

    let status: StatusFuncionario = 'fora';

    if (ultimoRegistro) {
      if (
        ultimoRegistro.tipo === 'ENTRADA' ||
        ultimoRegistro.tipo === 'VOLTA_ALMOCO'
      ) {
        status = 'trabalhando';
      } else if (ultimoRegistro.tipo === 'SAIDA_ALMOCO') {
        status = 'pausa';
      } else {
        status = 'fora';
      }
    }

    return {
      status,
      horasTrabalhadas: trabalhoMin,
      horasPausa: pausaMin,
      ultimaEntrada,
      ultimaSaida,
    };
  }

  async listarFuncionariosComPonto(data: string) {
    const inicioDia = this.getStartOfDay(data);
    const fimDia = this.getEndOfDay(data);
    const inicioSemana = this.getStartOfWeek(inicioDia);
    const fimSemana = this.getEndOfWeek(inicioDia);

    const funcionarios = await this.prisma.funcionarios.findMany({
      where: {
        status: 'ATIVO',
      },
      include: {
        usuarios: true,
        cargos: true,
      },
      orderBy: {
        matricula: 'asc',
      },
    });

    const funcionarioIds = funcionarios.map((f) => f.id);

    const registrosSemana = await this.prisma.registros_ponto.findMany({
      where: {
        funcionario_id: {
          in: funcionarioIds,
        },
        data_hora: {
          gte: inicioSemana,
          lte: fimSemana,
        },
      },
      orderBy: {
        data_hora: 'asc',
      },
    });

    return funcionarios.map((f) => {
      const registrosDoFuncionario = registrosSemana.filter(
        (r) => String(r.funcionario_id) === String(f.id),
      ) as RegistroPonto[];

      const registrosDia = registrosDoFuncionario.filter((r) => {
        return r.data_hora >= inicioDia && r.data_hora <= fimDia;
      });

      const resumoDia = this.calcularResumo(registrosDia);
      const resumoSemana = this.calcularResumo(registrosDoFuncionario);

      return {
        id: String(f.id),
        matricula: f.matricula,
        nome: f.usuarios.nome,
        cargo: f.cargos?.nome ?? 'Funcionário',
        cpf: f.cpf,
        status: resumoDia.status,
        horasTrabalhadas: this.formatMinutes(resumoDia.horasTrabalhadas),
        horasSemanais: this.formatMinutes(resumoSemana.horasTrabalhadas),
        horasPausa: this.formatMinutes(resumoDia.horasPausa),
        ultimaEntrada: resumoDia.ultimaEntrada,
        ultimaSaida: resumoDia.ultimaSaida,
        entradas: registrosDia.map((r) => ({
          id: String(r.id),
          type: this.mapTipo(r.tipo),
          timestamp: this.formatTime(r.data_hora),
        })),
      };
    });
  }
  private getDateLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'America/Sao_Paulo',
  })
    .format(date)
    .replace('.', '');
}

private getMonthStart(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

private contarStatus(registros: RegistroPonto[]) {
  if (!registros.length) return 'fora' as StatusFuncionario;

  const ultimo = registros[registros.length - 1];

  if (ultimo.tipo === 'ENTRADA' || ultimo.tipo === 'VOLTA_ALMOCO') {
    return 'trabalhando' as StatusFuncionario;
  }

  if (ultimo.tipo === 'SAIDA_ALMOCO') {
    return 'pausa' as StatusFuncionario;
  }

  return 'fora' as StatusFuncionario;
}

async obterOverview(data: string) {
  const inicioDia = this.getStartOfDay(data);
  const fimDia = this.getEndOfDay(data);
  const inicioSemana = this.getStartOfWeek(inicioDia);
  const fimSemana = this.getEndOfWeek(inicioDia);
  const inicioMes = this.getMonthStart(inicioDia);

  const funcionarios = await this.prisma.funcionarios.findMany({
    where: {
      status: 'ATIVO',
    },
    include: {
      usuarios: true,
      cargos: true,
    },
    orderBy: {
      matricula: 'asc',
    },
  });

  const funcionarioIds = funcionarios.map((f) => f.id);

  const registrosSemana = await this.prisma.registros_ponto.findMany({
    where: {
      funcionario_id: { in: funcionarioIds },
      data_hora: {
        gte: inicioSemana,
        lte: fimSemana,
      },
    },
    orderBy: {
      data_hora: 'asc',
    },
  });

  const registrosDia = registrosSemana.filter(
    (r) => r.data_hora >= inicioDia && r.data_hora <= fimDia,
  );

  const registrosMes = await this.prisma.registros_ponto.findMany({
    where: {
      funcionario_id: { in: funcionarioIds },
      data_hora: {
        gte: inicioMes,
        lte: fimDia,
      },
    },
    orderBy: {
      data_hora: 'asc',
    },
  });

  let trabalhando = 0;
  let emPausa = 0;
  let fora = 0;

  const topFuncionarios = funcionarios.map((f) => {
    const registrosFuncSemana = registrosSemana.filter(
      (r) => String(r.funcionario_id) === String(f.id),
    ) as RegistroPonto[];

    const registrosFuncDia = registrosDia.filter(
      (r) => String(r.funcionario_id) === String(f.id),
    ) as RegistroPonto[];

    const resumoDia = this.calcularResumo(registrosFuncDia);
    const resumoSemana = this.calcularResumo(registrosFuncSemana);

    const status = this.contarStatus(registrosFuncDia);

    if (status === 'trabalhando') trabalhando++;
    else if (status === 'pausa') emPausa++;
    else fora++;

    return {
      nome: f.usuarios.nome,
      cargo: f.cargos?.nome ?? 'Funcionário',
      horasSemanaMin: resumoSemana.horasTrabalhadas,
      horasDiaMin: resumoDia.horasTrabalhadas,
    };
  });

  const totalFuncionarios = funcionarios.length;
  const comRegistroHoje = new Set(registrosDia.map((r) => String(r.funcionario_id))).size;
  const taxaPresenca = totalFuncionarios > 0 ? Number(((comRegistroHoje / totalFuncionarios) * 100).toFixed(1)) : 0;
  
  const weeklyData: { dia: string; funcionarios: number; horas: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);

    const inicio = new Date(dia);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(dia);
    fim.setHours(23, 59, 59, 999);

    const registrosDiaSemana = registrosSemana.filter(
      (r) => r.data_hora >= inicio && r.data_hora <= fim,
    ) as RegistroPonto[];

    const horasDia = funcionarios.reduce((acc, f) => {
      const regs = registrosDiaSemana.filter(
        (r) => String(r.funcionario_id) === String(f.id),
      ) as RegistroPonto[];

      const resumo = this.calcularResumo(regs);
      return acc + resumo.horasTrabalhadas;
    }, 0);

    const presentes = new Set(registrosDiaSemana.map((r) => String(r.funcionario_id))).size;

    weeklyData.push({
      dia: this.getDateLabel(dia),
      funcionarios: presentes,
      horas: Math.round(horasDia / 60),
    });
  }

  const top3 = [...topFuncionarios]
    .sort((a, b) => b.horasSemanaMin - a.horasSemanaMin)
    .slice(0, 3)
    .map((f) => ({
      nome: f.nome,
      cargo: f.cargo,
      horasSemana: this.formatMinutes(f.horasSemanaMin),
      horasDia: this.formatMinutes(f.horasDiaMin),
    }));

  const funcionariosSemRegistroHoje = funcionarios.filter(
    (f) => !registrosDia.some((r) => String(r.funcionario_id) === String(f.id)),
  );

  const alerts = [
    ...(funcionariosSemRegistroHoje.length > 0
      ? [
          {
            id: '1',
            type: 'warning',
            message: `${funcionariosSemRegistroHoje.length} funcionário(s) sem registro hoje`,
            time: 'Hoje',
          },
        ]
      : []),
    {
      id: '2',
      type: 'info',
      message: `${comRegistroHoje} funcionário(s) registraram ponto hoje`,
      time: 'Hoje',
    },
    {
      id: '3',
      type: 'success',
      message: `Taxa de presença atual: ${taxaPresenca}%`,
      time: 'Hoje',
    },
  ];

  return {
    stats: {
      totalFuncionarios,
      trabalhando,
      emPausa,
      fora,
      taxaPresenca,
      registrosHoje: registrosDia.length,
      registrosMes: registrosMes.length,
    },
    weeklyData,
    topFuncionarios: top3,
    alerts,
  };
}
}