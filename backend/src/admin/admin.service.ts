import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TipoRegistro = 'ENTRADA' | 'SAIDA' | 'SAIDA_ALMOCO' | 'VOLTA_ALMOCO';
type StatusFuncionario = 'trabalhando' | 'pausa' | 'fora';

type RegistroPonto = {
  id: bigint;
  funcionario_id: bigint;
  tipo: TipoRegistro;
  data_hora: Date;
  data_referencia: Date;
};

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private getStartOfDay(dateString: string) {
    return new Date(`${dateString}T00:00:00`);
  }

  private getEndOfDay(dateString: string) {
    return new Date(`${dateString}T23:59:59.999`);
  }

  private getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getEndOfWeek(date: Date) {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private getMonthStart(date: Date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatMinutes(totalMinutes: number) {
    const safe = Math.max(0, Math.floor(totalMinutes));
    const hours = Math.floor(safe / 60);
    const minutes = safe % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min`;
  }

  private diffInMinutes(start: Date, end: Date) {
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  }

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

  private formatTime(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  }

  private getDateLabel(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      timeZone: 'America/Sao_Paulo',
    })
      .format(date)
      .replace('.', '');
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
      if (ultimoRegistro.tipo === 'ENTRADA' || ultimoRegistro.tipo === 'VOLTA_ALMOCO') {
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

  private agruparRegistrosPorFuncionario(registros: RegistroPonto[]) {
    const mapa = new Map<number, RegistroPonto[]>();

    for (const registro of registros) {
      const funcionarioId = Number(registro.funcionario_id);

      if (!mapa.has(funcionarioId)) {
        mapa.set(funcionarioId, []);
      }

      mapa.get(funcionarioId)!.push(registro);
    }

    return mapa;
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

    if (funcionarioIds.length === 0) {
      return [];
    }

    const registrosSemana = (await this.prisma.registros_ponto.findMany({
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
    })) as RegistroPonto[];

    const registrosPorFuncionario = this.agruparRegistrosPorFuncionario(registrosSemana);

    return funcionarios.map((f) => {
      const funcionarioId = Number(f.id);
      const registrosDoFuncionario = registrosPorFuncionario.get(funcionarioId) || [];

      const registrosDia = registrosDoFuncionario.filter((r) => {
        return r.data_hora >= inicioDia && r.data_hora <= fimDia;
      });

      const resumoDia = this.calcularResumo(registrosDia);
      const resumoSemana = this.calcularResumo(registrosDoFuncionario);

      return {
        id: Number(f.id),
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

    if (funcionarioIds.length === 0) {
      return {
        stats: {
          totalFuncionarios: 0,
          trabalhando: 0,
          emPausa: 0,
          fora: 0,
          taxaPresenca: 0,
          registrosHoje: 0,
          registrosMes: 0,
        },
        weeklyData: [],
        topFuncionarios: [],
        alerts: [],
      };
    }

    const registrosSemana = (await this.prisma.registros_ponto.findMany({
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
    })) as RegistroPonto[];

    const registrosMes = (await this.prisma.registros_ponto.findMany({
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
    })) as RegistroPonto[];

    const registrosDia = registrosSemana.filter(
      (r) => r.data_hora >= inicioDia && r.data_hora <= fimDia,
    );

    const registrosSemanaPorFuncionario = this.agruparRegistrosPorFuncionario(registrosSemana);
    const registrosDiaPorFuncionario = this.agruparRegistrosPorFuncionario(registrosDia);

    let trabalhando = 0;
    let emPausa = 0;
    let fora = 0;

    const topFuncionarios = funcionarios.map((f) => {
      const funcionarioId = Number(f.id);
      const registrosFuncSemana = registrosSemanaPorFuncionario.get(funcionarioId) || [];
      const registrosFuncDia = registrosDiaPorFuncionario.get(funcionarioId) || [];

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
    const comRegistroHoje = new Set(registrosDia.map((r) => Number(r.funcionario_id))).size;
    const taxaPresenca =
      totalFuncionarios > 0
        ? Number(((comRegistroHoje / totalFuncionarios) * 100).toFixed(1))
        : 0;

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

      const registrosDiaSemanaPorFuncionario = this.agruparRegistrosPorFuncionario(
        registrosDiaSemana,
      );

      const horasDia = funcionarios.reduce((acc, f) => {
        const regs = registrosDiaSemanaPorFuncionario.get(Number(f.id)) || [];
        const resumo = this.calcularResumo(regs);
        return acc + resumo.horasTrabalhadas;
      }, 0);

      const presentes = new Set(
        registrosDiaSemana.map((r) => Number(r.funcionario_id)),
      ).size;

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

    const funcionariosSemRegistroHoje = funcionarios.filter((f) => {
      return !registrosDia.some((r) => Number(r.funcionario_id) === Number(f.id));
    });

    const alerts = [
      ...(funcionariosSemRegistroHoje.length > 0
        ? [
            {
              id: '1',
              type: 'warning' as const,
              message: `${funcionariosSemRegistroHoje.length} funcionário(s) sem registro hoje`,
              time: 'Hoje',
            },
          ]
        : []),
      {
        id: '2',
        type: 'info' as const,
        message: `${comRegistroHoje} funcionário(s) registraram ponto hoje`,
        time: 'Hoje',
      },
      {
        id: '3',
        type: 'success' as const,
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