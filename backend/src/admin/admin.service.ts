import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { status_funcionario, tipo_perfil } from "@prisma/client";

type TipoRegistro = "ENTRADA" | "SAIDA" | "SAIDA_ALMOCO" | "VOLTA_ALMOCO";
type StatusFuncionario = "trabalhando" | "pausa" | "fora";

type RegistroPonto = {
  id: bigint;
  funcionario_id: bigint;
  tipo: TipoRegistro;
  data_hora: Date;
  data_referencia: Date;
};
export type CreateFuncionarioDto = {
  nome: string;
  email: string;
  senha: string;
  matricula: string;
  cpf: string;
  telefone?: string;
  data_nascimento?: string;
  data_admissao: string;
  cargo_id?: number | null;
  setor_id?: number | null;
  empresa_id?: number | null;
  unidade_id?: number | null;
  supervisor_id?: number | null;
  turno_nome?: string;
  carga_horaria_diaria?: number | null;
  tolerancia_minutos?: number;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  perfil?: tipo_perfil;
  status?: status_funcionario;
};

export type UpdateFuncionarioDto = Partial<CreateFuncionarioDto>;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService,  private readonly whatsappService: WhatsappService,) {}

  private sanitizeDigits(value?: string | null) {
    return String(value || "").replace(/\D/g, "");
  }

  private toDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateForUpdate(value?: string | null) {
    if (!value) return undefined;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private normalizeOptionalString(value?: string | null) {
    const normalized = String(value || "").trim();
    return normalized.length ? normalized : null;
  }

  private toBigIntId(value?: number | string | bigint | null) {
    if (value === undefined || value === null || value === "") return null;
    return BigInt(value);
  }

  private mapFuncionarioCrud(funcionario: any) {
    return {
      id: Number(funcionario.id),
      usuarioId: Number(funcionario.usuario_id),
      nome: funcionario.usuarios?.nome ?? "",
      email: funcionario.usuarios?.email ?? "",
      perfil: funcionario.usuarios?.perfil ?? "FUNCIONARIO",
      ativo: Boolean(funcionario.usuarios?.ativo),
      matricula: funcionario.matricula,
      cpf: funcionario.cpf,
      telefone: funcionario.telefone ?? "",
      dataNascimento: funcionario.data_nascimento
        ? funcionario.data_nascimento.toISOString().split("T")[0]
        : "",
      dataAdmissao: funcionario.data_admissao
        ? funcionario.data_admissao.toISOString().split("T")[0]
        : "",
      status: funcionario.status,
      cargoId: funcionario.cargo_id ? Number(funcionario.cargo_id) : null,
      cargo: funcionario.cargos?.nome ?? "",
      setorId: funcionario.setor_id ? Number(funcionario.setor_id) : null,
      setor: funcionario.setores?.nome ?? "",
      empresaId: funcionario.empresa_id ? Number(funcionario.empresa_id) : null,
      empresa: funcionario.empresas?.nome ?? "",
      unidadeId: funcionario.unidade_id ? Number(funcionario.unidade_id) : null,
      unidade: funcionario.unidades?.nome ?? "",
      supervisorId: funcionario.supervisor_id
        ? Number(funcionario.supervisor_id)
        : null,
      supervisor: funcionario.funcionarios?.usuarios?.nome ?? "",
      turnoNome: funcionario.turno_nome ?? "",
      cargaHorariaDiaria:
        funcionario.carga_horaria_diaria !== null &&
        funcionario.carga_horaria_diaria !== undefined
          ? Number(funcionario.carga_horaria_diaria)
          : null,
      toleranciaMinutos: funcionario.tolerancia_minutos,
      endereco: funcionario.endereco ?? "",
      cidade: funcionario.cidade ?? "",
      estado: funcionario.estado ?? "",
      cep: funcionario.cep ?? "",
      observacoes: funcionario.observacoes ?? "",
      createdAt: funcionario.created_at,
      updatedAt: funcionario.updated_at,
    };
  }

  private async validarRelacionamentos(dto: UpdateFuncionarioDto) {
    if (dto.cargo_id) {
      const cargo = await this.prisma.cargos.findUnique({
        where: { id: BigInt(dto.cargo_id) },
      });
      if (!cargo) throw new BadRequestException("Cargo informado não existe.");
    }

    if (dto.setor_id) {
      const setor = await this.prisma.setores.findUnique({
        where: { id: BigInt(dto.setor_id) },
      });
      if (!setor) throw new BadRequestException("Setor informado não existe.");
    }

    if (dto.empresa_id) {
      const empresa = await this.prisma.empresas.findUnique({
        where: { id: BigInt(dto.empresa_id) },
      });
      if (!empresa)
        throw new BadRequestException("Empresa informada não existe.");
    }

    if (dto.unidade_id) {
      const unidade = await this.prisma.unidades.findUnique({
        where: { id: BigInt(dto.unidade_id) },
      });
      if (!unidade)
        throw new BadRequestException("Unidade informada não existe.");
    }

    if (dto.supervisor_id) {
      const supervisor = await this.prisma.funcionarios.findUnique({
        where: { id: BigInt(dto.supervisor_id) },
      });
      if (!supervisor) {
        throw new BadRequestException("Supervisor informado não existe.");
      }
    }
  }

  private async validarCamposUnicos(
    dto: UpdateFuncionarioDto,
    funcionarioId?: bigint,
    usuarioId?: bigint,
  ) {
    if (dto.email) {
      const existente = await this.prisma.usuarios.findUnique({
        where: { email: dto.email.trim().toLowerCase() },
      });

      if (existente && existente.id !== usuarioId) {
        throw new BadRequestException("Já existe um usuário com este e-mail.");
      }
    }

    if (dto.matricula) {
      const existente = await this.prisma.funcionarios.findUnique({
        where: { matricula: dto.matricula.trim() },
      });

      if (existente && existente.id !== funcionarioId) {
        throw new BadRequestException(
          "Já existe um funcionário com esta matrícula.",
        );
      }
    }

    if (dto.cpf) {
      const cpf = this.sanitizeDigits(dto.cpf);
      if (cpf.length !== 11) {
        throw new BadRequestException("CPF inválido. Informe 11 dígitos.");
      }

      const existente = await this.prisma.funcionarios.findUnique({
        where: { cpf },
      });

      if (existente && existente.id !== funcionarioId) {
        throw new BadRequestException("Já existe um funcionário com este CPF.");
      }
    }
  }

  async listarOpcoesFuncionarios() {
    const [cargos, setores, empresas, unidades, supervisores] =
      await Promise.all([
        this.prisma.cargos.findMany({ orderBy: { nome: "asc" } }),
        this.prisma.setores.findMany({ orderBy: { nome: "asc" } }),
        this.prisma.empresas.findMany({ orderBy: { nome: "asc" } }),
        this.prisma.unidades.findMany({ orderBy: { nome: "asc" } }),
        this.prisma.funcionarios.findMany({
          where: { status: "ATIVO" },
          include: { usuarios: true },
          orderBy: { matricula: "asc" },
        }),
      ]);

    return {
      cargos: cargos.map((item) => ({ id: Number(item.id), nome: item.nome })),
      setores: setores.map((item) => ({
        id: Number(item.id),
        nome: item.nome,
      })),
      empresas: empresas.map((item) => ({
        id: Number(item.id),
        nome: item.nome,
      })),
      unidades: unidades.map((item) => ({
        id: Number(item.id),
        nome: item.nome,
        empresaId: Number(item.empresa_id),
      })),
      supervisores: supervisores.map((item) => ({
        id: Number(item.id),
        nome: item.usuarios?.nome ?? item.matricula,
        matricula: item.matricula,
      })),
      perfis: ["DONO", "ADMIN", "FUNCIONARIO"],
      status: ["ATIVO", "INATIVO"],
    };
  }

  async listarFuncionariosCrud(search?: string) {
    const term = String(search || "").trim();

    const funcionarios = await this.prisma.funcionarios.findMany({
      where: term
        ? {
            OR: [
              { matricula: { contains: term, mode: "insensitive" } },
              { cpf: { contains: term, mode: "insensitive" } },
              { usuarios: { nome: { contains: term, mode: "insensitive" } } },
              { usuarios: { email: { contains: term, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: {
        usuarios: true,
        cargos: true,
        setores: true,
        empresas: true,
        unidades: true,
        funcionarios: {
          include: {
            usuarios: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { matricula: "asc" }],
    });

    return funcionarios.map((funcionario) =>
      this.mapFuncionarioCrud(funcionario),
    );
  }

  async obterFuncionarioPorId(id: number) {
    const funcionario = await this.prisma.funcionarios.findUnique({
      where: { id: BigInt(id) },
      include: {
        usuarios: true,
        cargos: true,
        setores: true,
        empresas: true,
        unidades: true,
        funcionarios: { include: { usuarios: true } },
      },
    });

    if (!funcionario) {
      throw new NotFoundException("Funcionário não encontrado.");
    }

    return this.mapFuncionarioCrud(funcionario);
  }

  async criarFuncionario(dto: CreateFuncionarioDto) {
    if (
      !dto.nome ||
      !dto.email ||
      !dto.senha ||
      !dto.matricula ||
      !dto.cpf ||
      !dto.data_admissao
    ) {
      throw new BadRequestException(
        "Nome, e-mail, senha, matrícula, CPF e data de admissão são obrigatórios.",
      );
    }

    await this.validarRelacionamentos(dto);
    await this.validarCamposUnicos(dto);

    const dataAdmissao = this.toDate(dto.data_admissao);
    if (!dataAdmissao) {
      throw new BadRequestException("Data de admissão inválida.");
    }

    const dataNascimento = this.toDate(dto.data_nascimento);
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const funcionario = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.create({
        data: {
          nome: dto.nome.trim(),
          email: dto.email.trim().toLowerCase(),
          senha_hash: senhaHash,
          perfil: dto.perfil ?? "FUNCIONARIO",
          ativo: (dto.status ?? "ATIVO") === "ATIVO",
          empresa_id: this.toBigIntId(dto.empresa_id),
          unidade_id: this.toBigIntId(dto.unidade_id),
        },
      });

      return tx.funcionarios.create({
        data: {
          usuario_id: usuario.id,
          matricula: dto.matricula.trim(),
          cpf: this.sanitizeDigits(dto.cpf),
          telefone: this.normalizeOptionalString(dto.telefone),
          data_nascimento: dataNascimento,
          data_admissao: dataAdmissao,
          status: dto.status ?? "ATIVO",
          cargo_id: this.toBigIntId(dto.cargo_id),
          setor_id: this.toBigIntId(dto.setor_id),
          empresa_id: this.toBigIntId(dto.empresa_id),
          unidade_id: this.toBigIntId(dto.unidade_id),
          supervisor_id: this.toBigIntId(dto.supervisor_id),
          turno_nome: this.normalizeOptionalString(dto.turno_nome),
          carga_horaria_diaria:
            dto.carga_horaria_diaria !== undefined &&
            dto.carga_horaria_diaria !== null
              ? dto.carga_horaria_diaria
              : 8,
          tolerancia_minutos: dto.tolerancia_minutos ?? 10,
          endereco: this.normalizeOptionalString(dto.endereco),
          cidade: this.normalizeOptionalString(dto.cidade),
          estado:
            this.normalizeOptionalString(dto.estado)?.toUpperCase() ?? null,
          cep: this.normalizeOptionalString(dto.cep),
          observacoes: this.normalizeOptionalString(dto.observacoes),
        },
        include: {
          usuarios: true,
          cargos: true,
          setores: true,
          empresas: true,
          unidades: true,
          funcionarios: { include: { usuarios: true } },
        },
      });
    });

    return this.mapFuncionarioCrud(funcionario);
  }

      async listarAtestadosAdmin() {
    const atestados = await this.prisma.atestados.findMany({
      include: {
        funcionarios: {
          include: {
            usuarios: true,
            cargos: true,
          },
        },
        usuarios: true,
      },
      orderBy: [{ status: "asc" }, { created_at: "desc" }],
    });

    return atestados.map((item) => ({
      id: Number(item.id),
      funcionarioId: Number(item.funcionario_id),
      nome: item.funcionarios?.usuarios?.nome ?? "Funcionário",
      matricula: item.funcionarios?.matricula ?? "",
      cargo: item.funcionarios?.cargos?.nome ?? "Funcionário",
      dataInicio: item.data_inicio?.toISOString().split("T")[0],
      dataFim: item.data_fim?.toISOString().split("T")[0],
      dias: item.dias,
      cid: item.cid || "",
      observacoes: item.observacoes || "",
      status: item.status,
      nomeArquivo: item.nome_arquivo || "",
      arquivoUrl: item.arquivo_url || "",
      analisadoPor: item.usuarios?.nome || "",
      analisadoEm: item.analisado_em ? item.analisado_em.toISOString() : null,
    }));
  }

  async atualizarStatusAtestado(
    id: number,
    user: any,
    body: { status: "APROVADO" | "REJEITADO"; observacao?: string },
  ) {
    if (!["APROVADO", "REJEITADO"].includes(body.status)) {
      throw new BadRequestException("Status inválido.");
    }

    const usuarioId = BigInt(user?.usuarioId || user?.sub);

    const atestado = await this.prisma.atestados.findUnique({
      where: { id: BigInt(id) },
      include: {
        funcionarios: {
          include: {
            usuarios: true,
          },
        },
      },
    });

    if (!atestado) {
      throw new NotFoundException("Atestado não encontrado.");
    }

    const atualizado = await this.prisma.atestados.update({
      where: { id: BigInt(id) },
      data: {
        status: body.status,
        analisado_por: usuarioId,
        analisado_em: new Date(),
        observacoes: body.observacao || atestado.observacoes || null,
      },
      include: {
        funcionarios: {
          include: {
            usuarios: true,
          },
        },
        usuarios: true,
      },
    });

    try {
      const nomeFuncionario =
        atualizado.funcionarios?.usuarios?.nome || "Funcionário";

      const mensagem =
        body.status === "APROVADO"
          ? `Olá, ${nomeFuncionario}. Seu atestado foi aprovado.`
          : `Olá, ${nomeFuncionario}. Seu atestado foi rejeitado.`;

      if ((this.whatsappService as any)?.enviarMensagem) {
        await (this.whatsappService as any).enviarMensagem(mensagem);
      }
    } catch (error) {
      console.error("Erro ao notificar funcionário sobre atestado:", error);
    }

    return {
      id: Number(atualizado.id),
      status: atualizado.status,
      message: `Atestado ${body.status.toLowerCase()} com sucesso.`,
    };
  }

  async listarAdvertenciasAdmin() {
    const advertencias = await this.prisma.advertencias.findMany({
      include: {
        funcionarios: {
          include: {
            usuarios: true,
            cargos: true,
          },
        },
        usuarios: true,
      },
      orderBy: { created_at: "desc" },
    });

    return advertencias.map((item) => ({
      id: Number(item.id),
      funcionarioId: Number(item.funcionario_id),
      nome: item.funcionarios?.usuarios?.nome ?? "Funcionário",
      matricula: item.funcionarios?.matricula ?? "",
      cargo: item.funcionarios?.cargos?.nome ?? "Funcionário",
      tipo: item.tipo,
      motivo: item.motivo,
      descricao: item.descricao || "",
      dataAdvertencia: item.data_advertencia.toISOString().split("T")[0],
      aplicadaPor: item.usuarios?.nome || "",
    }));
  }

  async criarAdvertencia(
    user: any,
    body: {
      funcionario_id: number;
      tipo: string;
      motivo: string;
      descricao?: string;
      data_advertencia?: string;
    },
  ) {
    if (!body.funcionario_id || !body.tipo || !body.motivo) {
      throw new BadRequestException(
        "Funcionário, tipo e motivo são obrigatórios.",
      );
    }

    const usuarioId = BigInt(user?.usuarioId || user?.sub);

    const funcionario = await this.prisma.funcionarios.findUnique({
      where: { id: BigInt(body.funcionario_id) },
      include: {
        usuarios: true,
      },
    });

    if (!funcionario) {
      throw new NotFoundException("Funcionário não encontrado.");
    }

    const dataAdvertencia = body.data_advertencia
      ? new Date(`${body.data_advertencia}T00:00:00`)
      : new Date();

    const advertencia = await this.prisma.advertencias.create({
      data: {
        funcionario_id: BigInt(body.funcionario_id),
        tipo: body.tipo,
        motivo: body.motivo,
        descricao: body.descricao || null,
        data_advertencia: dataAdvertencia,
        aplicada_por: usuarioId,
      },
      include: {
        funcionarios: {
          include: {
            usuarios: true,
            cargos: true,
          },
        },
        usuarios: true,
      },
    });

    try {
      const nomeFuncionario =
        advertencia.funcionarios?.usuarios?.nome || "Funcionário";

      const mensagem = `Olá, ${nomeFuncionario}. Foi registrada uma advertência do tipo "${advertencia.tipo}" para você.`;

      if ((this.whatsappService as any)?.enviarMensagem) {
        await (this.whatsappService as any).enviarMensagem(mensagem);
      }
    } catch (error) {
      console.error("Erro ao notificar funcionário sobre advertência:", error);
    }

    return {
      id: Number(advertencia.id),
      message: "Advertência registrada com sucesso.",
    };
  }

  async atualizarFuncionario(id: number, dto: UpdateFuncionarioDto) {
    const funcionarioAtual = await this.prisma.funcionarios.findUnique({
      where: { id: BigInt(id) },
      include: { usuarios: true },
    });

    if (!funcionarioAtual) {
      throw new NotFoundException("Funcionário não encontrado.");
    }

    await this.validarRelacionamentos(dto);
    await this.validarCamposUnicos(
      dto,
      funcionarioAtual.id,
      funcionarioAtual.usuario_id,
    );

    const funcionario = await this.prisma.$transaction(async (tx) => {
      await tx.usuarios.update({
        where: { id: funcionarioAtual.usuario_id },
        data: {
          nome: dto.nome?.trim(),
          email: dto.email?.trim().toLowerCase(),
          perfil: dto.perfil,
          ativo: dto.status !== undefined ? dto.status === "ATIVO" : undefined,
          empresa_id:
            dto.empresa_id !== undefined
              ? this.toBigIntId(dto.empresa_id)
              : undefined,
          unidade_id:
            dto.unidade_id !== undefined
              ? this.toBigIntId(dto.unidade_id)
              : undefined,
          senha_hash: dto.senha ? await bcrypt.hash(dto.senha, 10) : undefined,
        },
      });

      return tx.funcionarios.update({
        where: { id: BigInt(id) },
        data: {
          matricula: dto.matricula?.trim(),
          cpf: dto.cpf ? this.sanitizeDigits(dto.cpf) : undefined,
          telefone:
            dto.telefone !== undefined
              ? this.normalizeOptionalString(dto.telefone)
              : undefined,
          data_nascimento:
            dto.data_nascimento !== undefined
              ? this.toDateForUpdate(dto.data_nascimento)
              : undefined,

          data_admissao:
            dto.data_admissao !== undefined
              ? this.toDateForUpdate(dto.data_admissao)
              : undefined,
          status: dto.status,
          cargo_id:
            dto.cargo_id !== undefined
              ? this.toBigIntId(dto.cargo_id)
              : undefined,
          setor_id:
            dto.setor_id !== undefined
              ? this.toBigIntId(dto.setor_id)
              : undefined,
          empresa_id:
            dto.empresa_id !== undefined
              ? this.toBigIntId(dto.empresa_id)
              : undefined,
          unidade_id:
            dto.unidade_id !== undefined
              ? this.toBigIntId(dto.unidade_id)
              : undefined,
          supervisor_id:
            dto.supervisor_id !== undefined
              ? this.toBigIntId(dto.supervisor_id)
              : undefined,
          turno_nome:
            dto.turno_nome !== undefined
              ? this.normalizeOptionalString(dto.turno_nome)
              : undefined,
          carga_horaria_diaria:
            dto.carga_horaria_diaria !== undefined
              ? dto.carga_horaria_diaria
              : undefined,
          tolerancia_minutos:
            dto.tolerancia_minutos !== undefined
              ? dto.tolerancia_minutos
              : undefined,
          endereco:
            dto.endereco !== undefined
              ? this.normalizeOptionalString(dto.endereco)
              : undefined,
          cidade:
            dto.cidade !== undefined
              ? this.normalizeOptionalString(dto.cidade)
              : undefined,
          estado:
            dto.estado !== undefined
              ? (this.normalizeOptionalString(dto.estado)?.toUpperCase() ??
                null)
              : undefined,
          cep:
            dto.cep !== undefined
              ? this.normalizeOptionalString(dto.cep)
              : undefined,
          observacoes:
            dto.observacoes !== undefined
              ? this.normalizeOptionalString(dto.observacoes)
              : undefined,
          updated_at: new Date(),
        },
        include: {
          usuarios: true,
          cargos: true,
          setores: true,
          empresas: true,
          unidades: true,
          funcionarios: { include: { usuarios: true } },
        },
      });
    });

    return this.mapFuncionarioCrud(funcionario);
  }

  async alternarStatusFuncionario(id: number) {
    const funcionarioAtual = await this.prisma.funcionarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!funcionarioAtual) {
      throw new NotFoundException("Funcionário não encontrado.");
    }

    const novoStatus =
      funcionarioAtual.status === "ATIVO" ? "INATIVO" : "ATIVO";

    const funcionario = await this.prisma.$transaction(async (tx) => {
      await tx.usuarios.update({
        where: { id: funcionarioAtual.usuario_id },
        data: {
          ativo: novoStatus === "ATIVO",
          updated_at: new Date(),
        },
      });

      return tx.funcionarios.update({
        where: { id: BigInt(id) },
        data: {
          status: novoStatus,
          updated_at: new Date(),
        },
        include: {
          usuarios: true,
          cargos: true,
          setores: true,
          empresas: true,
          unidades: true,
          funcionarios: { include: { usuarios: true } },
        },
      });
    });

    return this.mapFuncionarioCrud(funcionario);
  }

  async removerFuncionario(id: number) {
    const funcionarioAtual = await this.prisma.funcionarios.findUnique({
      where: { id: BigInt(id) },
    });

    if (!funcionarioAtual) {
      throw new NotFoundException("Funcionário não encontrado.");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.funcionarios.delete({
        where: { id: BigInt(id) },
      });

      await tx.usuarios.delete({
        where: { id: funcionarioAtual.usuario_id },
      });
    });

    return { message: "Funcionário removido com sucesso." };
  }
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
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}min`;
  }

  private diffInMinutes(start: Date, end: Date) {
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  }

  private mapTipo(tipo: TipoRegistro) {
    switch (tipo) {
      case "ENTRADA":
        return "entrada";
      case "SAIDA":
        return "saida";
      case "SAIDA_ALMOCO":
        return "pausa_inicio";
      case "VOLTA_ALMOCO":
        return "pausa_fim";
      default:
        return "entrada";
    }
  }

  private formatTime(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(date);
  }

  private getDateLabel(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      timeZone: "America/Sao_Paulo",
    })
      .format(date)
      .replace(".", "");
  }

  private calcularResumo(registros: RegistroPonto[]) {
    if (!registros.length) {
      return {
        status: "fora" as StatusFuncionario,
        horasTrabalhadas: 0,
        horasPausa: 0,
        ultimaEntrada: "-",
        ultimaSaida: "-",
      };
    }

    let trabalhoMin = 0;
    let pausaMin = 0;
    let inicioTrabalho: Date | null = null;
    let inicioPausa: Date | null = null;
    let ultimaEntrada = "-";
    let ultimaSaida = "-";

    for (const registro of registros) {
      const dataHora = registro.data_hora;

      switch (registro.tipo) {
        case "ENTRADA":
          inicioTrabalho = dataHora;
          ultimaEntrada = this.formatTime(dataHora);
          break;

        case "SAIDA_ALMOCO":
          if (inicioTrabalho) {
            trabalhoMin += this.diffInMinutes(inicioTrabalho, dataHora);
            inicioTrabalho = null;
          }
          inicioPausa = dataHora;
          ultimaSaida = this.formatTime(dataHora);
          break;

        case "VOLTA_ALMOCO":
          if (inicioPausa) {
            pausaMin += this.diffInMinutes(inicioPausa, dataHora);
            inicioPausa = null;
          }
          inicioTrabalho = dataHora;
          ultimaEntrada = this.formatTime(dataHora);
          break;

        case "SAIDA":
          if (inicioTrabalho) {
            trabalhoMin += this.diffInMinutes(inicioTrabalho, dataHora);
            inicioTrabalho = null;
          }
          ultimaSaida = this.formatTime(dataHora);
          break;
      }
    }

    const ultimoRegistro = registros[registros.length - 1];
    let status: StatusFuncionario = "fora";

    if (ultimoRegistro) {
      if (
        ultimoRegistro.tipo === "ENTRADA" ||
        ultimoRegistro.tipo === "VOLTA_ALMOCO"
      ) {
        status = "trabalhando";
      } else if (ultimoRegistro.tipo === "SAIDA_ALMOCO") {
        status = "pausa";
      } else {
        status = "fora";
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
    if (!registros.length) return "fora" as StatusFuncionario;

    const ultimo = registros[registros.length - 1];

    if (ultimo.tipo === "ENTRADA" || ultimo.tipo === "VOLTA_ALMOCO") {
      return "trabalhando" as StatusFuncionario;
    }

    if (ultimo.tipo === "SAIDA_ALMOCO") {
      return "pausa" as StatusFuncionario;
    }

    return "fora" as StatusFuncionario;
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
        status: "ATIVO",
      },
      include: {
        usuarios: true,
        cargos: true,
      },
      orderBy: {
        matricula: "asc",
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
        data_hora: "asc",
      },
    })) as RegistroPonto[];

    const registrosPorFuncionario =
      this.agruparRegistrosPorFuncionario(registrosSemana);

    return funcionarios.map((f) => {
      const funcionarioId = Number(f.id);
      const registrosDoFuncionario =
        registrosPorFuncionario.get(funcionarioId) || [];

      const registrosDia = registrosDoFuncionario.filter((r) => {
        return r.data_hora >= inicioDia && r.data_hora <= fimDia;
      });

      const resumoDia = this.calcularResumo(registrosDia);
      const resumoSemana = this.calcularResumo(registrosDoFuncionario);

      return {
        id: Number(f.id),
        matricula: f.matricula,
        nome: f.usuarios.nome,
        cargo: f.cargos?.nome ?? "Funcionário",
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
        status: "ATIVO",
      },
      include: {
        usuarios: true,
        cargos: true,
      },
      orderBy: {
        matricula: "asc",
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
        data_hora: "asc",
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
        data_hora: "asc",
      },
    })) as RegistroPonto[];

    const registrosDia = registrosSemana.filter(
      (r) => r.data_hora >= inicioDia && r.data_hora <= fimDia,
    );

    const registrosSemanaPorFuncionario =
      this.agruparRegistrosPorFuncionario(registrosSemana);
    const registrosDiaPorFuncionario =
      this.agruparRegistrosPorFuncionario(registrosDia);

    let trabalhando = 0;
    let emPausa = 0;
    let fora = 0;

    const topFuncionarios = funcionarios.map((f) => {
      const funcionarioId = Number(f.id);
      const registrosFuncSemana =
        registrosSemanaPorFuncionario.get(funcionarioId) || [];
      const registrosFuncDia =
        registrosDiaPorFuncionario.get(funcionarioId) || [];

      const resumoDia = this.calcularResumo(registrosFuncDia);
      const resumoSemana = this.calcularResumo(registrosFuncSemana);
      const status = this.contarStatus(registrosFuncDia);

      if (status === "trabalhando") trabalhando++;
      else if (status === "pausa") emPausa++;
      else fora++;

      return {
        nome: f.usuarios.nome,
        cargo: f.cargos?.nome ?? "Funcionário",
        horasSemanaMin: resumoSemana.horasTrabalhadas,
        horasDiaMin: resumoDia.horasTrabalhadas,
      };
    });

    const totalFuncionarios = funcionarios.length;
    const comRegistroHoje = new Set(
      registrosDia.map((r) => Number(r.funcionario_id)),
    ).size;
    const taxaPresenca =
      totalFuncionarios > 0
        ? Number(((comRegistroHoje / totalFuncionarios) * 100).toFixed(1))
        : 0;

    const weeklyData: { dia: string; funcionarios: number; horas: number }[] =
      [];

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

      const registrosDiaSemanaPorFuncionario =
        this.agruparRegistrosPorFuncionario(registrosDiaSemana);

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
      return !registrosDia.some(
        (r) => Number(r.funcionario_id) === Number(f.id),
      );
    });

    const alerts = [
      ...(funcionariosSemRegistroHoje.length > 0
        ? [
            {
              id: "1",
              type: "warning" as const,
              message: `${funcionariosSemRegistroHoje.length} funcionário(s) sem registro hoje`,
              time: "Hoje",
            },
          ]
        : []),
      {
        id: "2",
        type: "info" as const,
        message: `${comRegistroHoje} funcionário(s) registraram ponto hoje`,
        time: "Hoje",
      },
      {
        id: "3",
        type: "success" as const,
        message: `Taxa de presença atual: ${taxaPresenca}%`,
        time: "Hoje",
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
