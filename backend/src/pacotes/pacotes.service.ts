import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type StatusPacote = 'RECEBIDO' | 'EM_ROTA' | 'ENTREGUE' | 'CANCELADO';
type PrioridadePacote = 'NORMAL' | 'URGENTE' | 'EXPRESSA';

@Injectable()
export class PacotesService {
  constructor(private readonly prisma: PrismaService) {}

  private getUsuarioId(user: any): bigint {
    const id = user?.id || user?.usuarioId || user?.sub;

    if (!id) {
      throw new BadRequestException('Usuário logado não identificado.');
    }

    return BigInt(id);
  }

  private formatarPacote(pacote: any) {
    return {
      id: Number(pacote.id),
      codigo: pacote.codigo,
      destinatario: pacote.destinatario,
      endereco: pacote.endereco,
      status: pacote.status,
      prioridade: pacote.prioridade,
      observacao: pacote.observacao,
      responsavelNome: pacote.responsavel?.nome || null,
      responsavelMatricula: pacote.responsavel?.funcionarios?.matricula || null,
      createdAt: pacote.created_at,
      updatedAt: pacote.updated_at,
      entregueEm: pacote.entregue_em,
    };
  }

  private formatarPacoteComHistorico(pacote: any) {
    return {
      ...this.formatarPacote(pacote),
      historico:
        pacote.movimentacoes?.map((mov: any) => ({
          id: Number(mov.id),
          status: mov.status,
          observacao: mov.observacao,
          usuarioNome: mov.usuario?.nome || null,
          usuarioMatricula: mov.usuario?.funcionarios?.matricula || null,
          createdAt: mov.created_at,
        })) || [],
    };
  }

  async listar() {
    const pacotes = await this.prisma.pacotes.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        responsavel: {
          include: {
            funcionarios: true,
          },
        },
      },
    });

    return pacotes.map((pacote) => this.formatarPacote(pacote));
  }

  async criar(
    user: any,
    body: {
      codigo: string;
      destinatario: string;
      endereco: string;
      prioridade?: PrioridadePacote;
      observacao?: string;
    },
  ) {
    const codigo = String(body.codigo || '').trim();
    const destinatario = String(body.destinatario || '').trim();
    const endereco = String(body.endereco || '').trim();
    const prioridade = body.prioridade || 'NORMAL';

    if (!codigo || !destinatario || !endereco) {
      throw new BadRequestException(
        'Código, destinatário e endereço são obrigatórios.',
      );
    }

    if (!['NORMAL', 'URGENTE', 'EXPRESSA'].includes(prioridade)) {
      throw new BadRequestException('Prioridade inválida.');
    }

    const existente = await this.prisma.pacotes.findUnique({
      where: { codigo },
    });

    if (existente) {
      throw new ConflictException('Já existe um pacote com este código.');
    }

    const usuarioId = this.getUsuarioId(user);

    const pacote = await this.prisma.pacotes.create({
      data: {
        codigo,
        destinatario,
        endereco,
        prioridade,
        status: 'RECEBIDO',
        observacao: body.observacao?.trim() || null,
        responsavel_usuario_id: usuarioId,
      },
      include: {
        responsavel: {
          include: {
            funcionarios: true,
          },
        },
      },
    });

    return this.formatarPacote(pacote);
  }

  async entradaFuncionario(
    user: any,
    body: {
      codigo: string;
      destinatario: string;
      endereco: string;
      observacao?: string;
    },
  ) {
    const codigo = String(body.codigo || '').trim();
    const destinatario = String(body.destinatario || '').trim();
    const endereco = String(body.endereco || '').trim();

    if (!codigo || !destinatario || !endereco) {
      throw new BadRequestException(
        'Código, destinatário e endereço são obrigatórios.',
      );
    }

    const existente = await this.prisma.pacotes.findUnique({
      where: { codigo },
    });

    if (existente) {
      throw new ConflictException('Já existe um pacote com este código.');
    }

    const usuarioId = this.getUsuarioId(user);

    const pacote = await this.prisma.pacotes.create({
      data: {
        codigo,
        destinatario,
        endereco,
        status: 'RECEBIDO',
        prioridade: 'NORMAL',
        observacao: body.observacao?.trim() || null,
        responsavel_usuario_id: usuarioId,
        movimentacoes: {
          create: {
            usuario_id: usuarioId,
            status: 'RECEBIDO',
            observacao: 'Pacote registrado pelo funcionário.',
          },
        },
      },
      include: {
        responsavel: {
          include: {
            funcionarios: true,
          },
        },
        movimentacoes: {
          orderBy: {
            created_at: 'desc',
          },
          include: {
            usuario: {
              include: {
                funcionarios: true,
              },
            },
          },
        },
      },
    });

    return this.formatarPacoteComHistorico(pacote);
  }

  async atualizarStatus(id: number, user: any, status: StatusPacote) {
    if (!['RECEBIDO', 'EM_ROTA', 'ENTREGUE', 'CANCELADO'].includes(status)) {
      throw new BadRequestException('Status inválido.');
    }

    const pacote = await this.prisma.pacotes.findUnique({
      where: { id: BigInt(id) },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado.');
    }

    const usuarioId = this.getUsuarioId(user);

    const atualizado = await this.prisma.pacotes.update({
      where: { id: BigInt(id) },
      data: {
        status,
        responsavel_usuario_id: usuarioId,
        entregue_em: status === 'ENTREGUE' ? new Date() : null,
        movimentacoes: {
          create: {
            usuario_id: usuarioId,
            status,
            observacao: `Status alterado para ${status}.`,
          },
        },
      },
      include: {
        responsavel: {
          include: {
            funcionarios: true,
          },
        },
        movimentacoes: {
          orderBy: {
            created_at: 'desc',
          },
          include: {
            usuario: {
              include: {
                funcionarios: true,
              },
            },
          },
        },
      },
    });

    return this.formatarPacoteComHistorico(atualizado);
  }

  async biparPacote(user: any, body: { codigo: string; observacao?: string }) {
    const codigo = String(body.codigo || '').trim();

    if (!codigo) {
      throw new BadRequestException('Código do pacote é obrigatório.');
    }

    const usuarioId = this.getUsuarioId(user);

    const pacote = await this.prisma.pacotes.findUnique({
      where: { codigo },
    });

    if (!pacote) {
      const novoPacote = await this.prisma.pacotes.create({
        data: {
          codigo,
          destinatario: 'Não informado',
          endereco: 'Não informado',
          status: 'RECEBIDO',
          prioridade: 'NORMAL',
          observacao: body.observacao?.trim() || 'Criado por bipagem/scanner.',
          responsavel_usuario_id: usuarioId,
          movimentacoes: {
            create: {
              usuario_id: usuarioId,
              status: 'RECEBIDO',
              observacao: 'Pacote criado por bipagem.',
            },
          },
        },
        include: {
          responsavel: {
            include: {
              funcionarios: true,
            },
          },
          movimentacoes: {
            orderBy: {
              created_at: 'desc',
            },
            include: {
              usuario: {
                include: {
                  funcionarios: true,
                },
              },
            },
          },
        },
      });

      return this.formatarPacoteComHistorico(novoPacote);
    }

    let novoStatus: StatusPacote = 'RECEBIDO';

    if (pacote.status === 'RECEBIDO') {
      novoStatus = 'EM_ROTA';
    }

    if (pacote.status === 'EM_ROTA') {
      novoStatus = 'ENTREGUE';
    }

    if (pacote.status === 'ENTREGUE') {
      throw new BadRequestException('Este pacote já foi entregue.');
    }

    if (pacote.status === 'CANCELADO') {
      throw new BadRequestException('Este pacote está cancelado.');
    }

    const atualizado = await this.prisma.pacotes.update({
      where: {
        id: pacote.id,
      },
      data: {
        status: novoStatus,
        responsavel_usuario_id: usuarioId,
        entregue_em: novoStatus === 'ENTREGUE' ? new Date() : null,
        movimentacoes: {
          create: {
            usuario_id: usuarioId,
            status: novoStatus,
            observacao:
              body.observacao?.trim() ||
              `Status alterado automaticamente por bipagem para ${novoStatus}.`,
          },
        },
      },
      include: {
        responsavel: {
          include: {
            funcionarios: true,
          },
        },
        movimentacoes: {
          orderBy: {
            created_at: 'desc',
          },
          include: {
            usuario: {
              include: {
                funcionarios: true,
              },
            },
          },
        },
      },
    });

    return this.formatarPacoteComHistorico(atualizado);
  }

  async buscarPorCodigo(codigo: string) {
    const pacote = await this.prisma.pacotes.findUnique({
      where: {
        codigo: String(codigo || '').trim(),
      },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado.');
    }

    return {
      codigo: pacote.codigo,
      destinatario: pacote.destinatario,
      endereco: pacote.endereco,
    };
  }

  async historico(id: number) {
    const pacote = await this.prisma.pacotes.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        movimentacoes: {
          orderBy: {
            created_at: 'desc',
          },
          include: {
            usuario: {
              include: {
                funcionarios: true,
              },
            },
          },
        },
      },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado.');
    }

    return pacote.movimentacoes.map((mov) => ({
      id: Number(mov.id),
      status: mov.status,
      observacao: mov.observacao,
      usuarioNome: mov.usuario?.nome || null,
      usuarioMatricula: mov.usuario?.funcionarios?.matricula || null,
      createdAt: mov.created_at,
    }));
  }

  async remover(id: number) {
    const pacote = await this.prisma.pacotes.findUnique({
      where: { id: BigInt(id) },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado.');
    }

    await this.prisma.pacotes.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: 'Pacote removido com sucesso.',
    };
  }
}