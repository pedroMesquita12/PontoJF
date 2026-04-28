import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { tipo_registro_ponto } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsappService } from "../whatsapp/whatsapp.service";
import { createClient } from "@supabase/supabase-js";
import { extname } from "path";

type LocalPermitido = {
  nome: string;
  latitude: number;
  longitude: number;
  raio: number;
};

@Injectable()
export class PontoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  private sanitizeFilename(filename: string) {
    return String(filename || "arquivo")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  private getSupabaseStorageClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados");
    }

    return createClient(supabaseUrl, supabaseServiceKey);
  }

  private async uploadAtestadoSupabase(
    funcionarioId: bigint,
    arquivo: Express.Multer.File,
  ) {
    const supabase = this.getSupabaseStorageClient();
    const bucket = process.env.SUPABASE_ATESTADOS_BUCKET || "atestados";

    const extensao =
      extname(arquivo.originalname || "").toLowerCase() || ".bin";
    const nomeOriginalSemExtensao = (
      arquivo.originalname || "atestado"
    ).replace(extname(arquivo.originalname || ""), "");

    const nomeSeguro = this.sanitizeFilename(nomeOriginalSemExtensao);
    const path = `funcionario_${funcionarioId.toString()}_${Date.now()}_${nomeSeguro}${extensao}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, arquivo.buffer, {
        contentType: arquivo.mimetype,
        upsert: false,
      });

    if (error || !data?.path) {
      throw new BadRequestException(
        error?.message || "Não foi possível enviar o atestado.",
      );
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage.from(bucket).createSignedUrl(data.path, 60 * 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new BadRequestException(
        signedUrlError?.message || "Não foi possível gerar a URL do atestado.",
      );
    }

    return {
      path: data.path,
      signedUrl: signedUrlData.signedUrl,
    };
  }

  private readonly locaisPermitidos: LocalPermitido[] = [
    {
      nome: "Unidade 1 - Rua Abuassali Abujamra, 209",
      latitude: -22.9768652,
      longitude: -49.8795224,
      raio: 300,
    },
    {
      nome: "Unidade 2 - Rua Amazonas, 530",
      latitude: -22.974029,
      longitude: -49.868587,
      raio: 300,
    },
  ];

  private formatarDuracao(ms: number): string {
    if (ms <= 0) return "0min";

    const totalMinutos = Math.floor(ms / 1000 / 60);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;

    return `${horas}h ${minutos}min`;
  }

  private normalizarCoordenada(
    valor: number,
    tipo: "latitude" | "longitude",
  ): number {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      throw new BadRequestException(`${tipo} inválida`);
    }

    if (tipo === "latitude" && (numero < -90 || numero > 90)) {
      throw new BadRequestException("Latitude fora do intervalo válido");
    }

    if (tipo === "longitude" && (numero < -180 || numero > 180)) {
      throw new BadRequestException("Longitude fora do intervalo válido");
    }

    return Number(numero.toFixed(8));
  }

  private validarCoordenadas(latitude?: number, longitude?: number) {
    if (latitude == null || longitude == null) {
      throw new BadRequestException("Localização não informada");
    }

    const lat = this.normalizarCoordenada(latitude, "latitude");
    const lng = this.normalizarCoordenada(longitude, "longitude");

    return { lat, lng };
  }

  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private encontrarLocalMaisProximo(latitude: number, longitude: number) {
    let localMaisProximo: LocalPermitido | null = null;
    let menorDistancia = Infinity;

    for (const local of this.locaisPermitidos) {
      const distancia = this.calcularDistancia(
        latitude,
        longitude,
        local.latitude,
        local.longitude,
      );

      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        localMaisProximo = local;
      }
    }

    return {
      local: localMaisProximo,
      distancia: menorDistancia,
    };
  }

  private montarLinkMapa(latitude: number, longitude: number) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  private formatarMinutos(total: number) {
    const horas = Math.floor(Math.abs(total) / 60);
    const minutos = Math.abs(total) % 60;
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  }

  private async buscarFuncionarioPorUsuario(user: any) {
  const usuarioId = user?.usuarioId;

  if (!usuarioId) {
    throw new NotFoundException("Usuário não encontrado no token.");
  }

  const funcionario = await this.prisma.funcionarios.findFirst({
    where: {
      usuario_id: BigInt(usuarioId),
    },
  });

  if (!funcionario) {
    throw new NotFoundException("Funcionário não encontrado no banco.");
  }

  return funcionario;
}

  async registrarPonto(
    funcionarioId: number,
    tipo: string,
    latitude?: number,
    longitude?: number,
    accuracy?: number,
  ) {
    try {
      const { lat, lng } = this.validarCoordenadas(latitude, longitude);

      const accuracyNormalizada =
        accuracy == null || Number.isNaN(Number(accuracy))
          ? null
          : Number(Number(accuracy).toFixed(2));

      console.log("REGISTRAR PONTO:", {
        funcionarioId,
        tipo,
        latitudeOriginal: latitude,
        longitudeOriginal: longitude,
        latitudeNormalizada: lat,
        longitudeNormalizada: lng,
        accuracy: accuracyNormalizada,
      });

      if (accuracyNormalizada != null && accuracyNormalizada > 100) {
        throw new BadRequestException(
          `Localização imprecisa (${Math.round(accuracyNormalizada)}m). Ative o GPS e tente novamente.`,
        );
      }

      const tiposValidos = [
        "ENTRADA",
        "SAIDA_ALMOCO",
        "VOLTA_ALMOCO",
        "SAIDA",
      ] as const;

      const tipoNormalizado = tipo.toUpperCase() as tipo_registro_ponto;

      if (!tiposValidos.includes(tipoNormalizado)) {
        throw new BadRequestException("Tipo de ponto inválido");
      }

      const resultadoLocal = this.encontrarLocalMaisProximo(lat, lng);

      if (!resultadoLocal.local) {
        throw new BadRequestException("Nenhum local permitido foi encontrado");
      }

      console.log("LOCAL MAIS PRÓXIMO:", resultadoLocal.local.nome);
      console.log(
        "DISTÂNCIA ATÉ O LOCAL:",
        Math.round(resultadoLocal.distancia),
        "m",
      );

      if (resultadoLocal.distancia > resultadoLocal.local.raio) {
        throw new BadRequestException(
          `Você está fora da área permitida para registrar ponto. Local mais próximo: ${
            resultadoLocal.local.nome
          } (${Math.round(resultadoLocal.distancia)}m)`,
        );
      }

      const funcionario = await this.prisma.funcionarios.findUnique({
        where: {
          id: BigInt(funcionarioId),
        },
        select: {
          id: true,
          usuarios: {
            select: {
              nome: true,
            },
          },
        },
      });

      if (!funcionario) {
        throw new BadRequestException("Funcionário não encontrado");
      }

      const agora = new Date();

      const resultado = await this.prisma.registros_ponto.create({
        data: {
          funcionario_id: BigInt(funcionarioId),
          tipo: tipoNormalizado,
          data_hora: agora,
          latitude: lat,
          longitude: lng,
          observacao: `Local do ponto: ${resultadoLocal.local.nome}`,
        },
      });

      console.log("PONTO SALVO:", resultado);

      const horarioFormatado = new Date(resultado.data_hora).toLocaleString(
        "pt-BR",
        {
          timeZone: "America/Sao_Paulo",
        },
      );

      let tempoTrabalhado = "Ainda não calculado";

      if (tipoNormalizado === "SAIDA") {
        const ultimaEntrada = await this.prisma.registros_ponto.findFirst({
          where: {
            funcionario_id: BigInt(funcionarioId),
            tipo: "ENTRADA",
            data_hora: {
              lt: resultado.data_hora,
            },
          },
          orderBy: {
            data_hora: "desc",
          },
        });

        if (ultimaEntrada) {
          const diferencaMs =
            new Date(resultado.data_hora).getTime() -
            new Date(ultimaEntrada.data_hora).getTime();

          tempoTrabalhado = this.formatarDuracao(diferencaMs);
        } else {
          tempoTrabalhado = "Sem entrada anterior";
        }
      }

      try {
        const linkMapa = this.montarLinkMapa(lat, lng);

        await this.whatsappService.enviarMensagemRegistroPonto({
          nome: funcionario.usuarios.nome,
          tipo: tipoNormalizado,
          horario: horarioFormatado,
          tempo: tempoTrabalhado,
          local: `${resultadoLocal.local.nome} | ${linkMapa}`,
        });

        console.log("WHATSAPP ENVIADO COM SUCESSO");
      } catch (erroWhatsapp) {
        console.error("ERRO AO ENVIAR WHATSAPP:", erroWhatsapp);
      }

      return {
        ...resultado,
        id: resultado.id.toString(),
        funcionario_id: resultado.funcionario_id.toString(),
      };
    } catch (error) {
      console.error("ERRO AO REGISTRAR PONTO:", error);
      throw error;
    }
  }

  async listarPontos(funcionarioId: number) {
    try {
      console.log("LISTAR PONTOS:", { funcionarioId });

      const agora = new Date();

      const inicioDoDia = new Date(agora);
      inicioDoDia.setHours(0, 0, 0, 0);

      const fimDoDia = new Date(agora);
      fimDoDia.setHours(23, 59, 59, 999);

      const pontos = await this.prisma.registros_ponto.findMany({
        where: {
          funcionario_id: BigInt(funcionarioId),
          data_hora: {
            gte: inicioDoDia,
            lte: fimDoDia,
          },
        },
        orderBy: {
          data_hora: "asc",
        },
        select: {
          id: true,
          tipo: true,
          data_hora: true,
        },
      });

      return pontos.map((ponto) => ({
        id: ponto.id.toString(),
        tipo: ponto.tipo,
        data_hora: ponto.data_hora,
      }));
    } catch (error) {
      console.error("ERRO AO LISTAR PONTOS:", error);
      throw error;
    }
  }

  async obterHorasExtrasFuncionario(user: any) {
    const funcionario = await this.buscarFuncionarioPorUsuario(user);

    const registros = await this.prisma.registros_ponto.findMany({
      where: {
        funcionario_id: funcionario.id,
      },
      orderBy: [{ data_referencia: "desc" }, { data_hora: "asc" }],
      take: 200,
    });

    const agrupado = new Map<string, any[]>();

    for (const registro of registros) {
      const data = new Date(registro.data_referencia)
        .toISOString()
        .split("T")[0];
      if (!agrupado.has(data)) {
        agrupado.set(data, []);
      }
      agrupado.get(data)?.push(registro);
    }

    const cargaDiariaMin = Number(funcionario.carga_horaria_diaria || 8) * 60;
    const tolerancia = Number(funcionario.tolerancia_minutos || 10);

    const historico = Array.from(agrupado.entries()).map(([data, itens]) => {
      const ordenados = [...itens].sort(
        (a, b) =>
          new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime(),
      );

      let minutosTrabalhados = 0;

      for (let i = 0; i < ordenados.length - 1; i += 2) {
        const inicio = new Date(ordenados[i].data_hora).getTime();
        const fim = new Date(ordenados[i + 1].data_hora).getTime();
        minutosTrabalhados += Math.max(0, Math.floor((fim - inicio) / 60000));
      }

      let saldo = minutosTrabalhados - cargaDiariaMin;

      if (Math.abs(saldo) <= tolerancia) {
        saldo = 0;
      }

      return {
        data,
        minutosTrabalhados,
        cargaDiariaMin,
        saldoMinutos: saldo,
        horasExtrasMinutos: saldo > 0 ? saldo : 0,
        horasExtrasFormatadas: this.formatarMinutos(saldo > 0 ? saldo : 0),
      };
    });

    const saldoTotalMinutos = historico.reduce(
      (acc, item) => acc + item.horasExtrasMinutos,
      0,
    );

    return {
      saldoTotalMinutos,
      saldoTotalFormatado: this.formatarMinutos(saldoTotalMinutos),
      historico,
    };
  }

  async listarAdvertenciasFuncionario(user: any) {
    const funcionario = await this.buscarFuncionarioPorUsuario(user);

    const advertencias = await this.prisma.advertencias.findMany({
      where: { funcionario_id: funcionario.id },
      orderBy: { data_advertencia: "desc" },
    });

    return advertencias.map((item) => ({
      id: Number(item.id),
      tipo: item.tipo,
      motivo: item.motivo,
      descricao: item.descricao || "",
      dataAdvertencia: new Date(item.data_advertencia)
        .toISOString()
        .split("T")[0],
    }));
  }

  async listarAtestadosFuncionario(user: any) {
    const funcionario = await this.buscarFuncionarioPorUsuario(user);

    const atestados = await this.prisma.atestados.findMany({
      where: { funcionario_id: funcionario.id },
      orderBy: { created_at: "desc" },
    });

    return atestados.map((item) => ({
      id: Number(item.id),
      dataInicio: new Date(item.data_inicio).toISOString().split("T")[0],
      dataFim: new Date(item.data_fim).toISOString().split("T")[0],
      dias: item.dias,
      cid: item.cid || "",
      observacoes: item.observacoes || "",
      status: item.status,
      arquivoUrl: item.arquivo_url || "",
      nomeArquivo: item.nome_arquivo || "",
    }));
  }

  async enviarAtestado(user: any, body: any, arquivo?: Express.Multer.File) {
    const funcionario = await this.buscarFuncionarioPorUsuario(user);

    if (!body?.data_inicio || !body?.data_fim) {
      throw new BadRequestException(
        "Data de início e data de fim são obrigatórias.",
      );
    }

    if (!arquivo) {
      throw new BadRequestException("O arquivo do atestado é obrigatório.");
    }

    const dataInicio = new Date(`${body.data_inicio}T00:00:00`);
    const dataFim = new Date(`${body.data_fim}T00:00:00`);

    if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) {
      throw new BadRequestException("Datas do atestado inválidas.");
    }

    if (dataFim < dataInicio) {
      throw new BadRequestException(
        "A data final não pode ser anterior à data inicial.",
      );
    }

    const upload = await this.uploadAtestadoSupabase(funcionario.id, arquivo);

    const criado = await this.prisma.atestados.create({
      data: {
        funcionario_id: funcionario.id,
        data_inicio: dataInicio,
        data_fim: dataFim,
        dias: body.dias ? Number(body.dias) : null,
        cid: body.cid || null,
        observacoes: body.observacoes || null,
        arquivo_url: upload.path,
        nome_arquivo: arquivo.originalname,
        status: "PENDENTE",
      },
    });

    return {
      id: Number(criado.id),
      arquivoUrl: upload.signedUrl,
      message: "Atestado enviado com sucesso.",
    };
  }
  async gerarLinkAtestado(user: any, atestadoId: number) {
    const funcionario = await this.buscarFuncionarioPorUsuario(user);

    const atestado = await this.prisma.atestados.findFirst({
      where: {
        id: BigInt(atestadoId),
        funcionario_id: funcionario.id,
      },
    });

    if (!atestado) {
      throw new NotFoundException("Atestado não encontrado.");
    }

    if (!atestado.arquivo_url) {
      throw new BadRequestException("Este atestado não possui arquivo.");
    }

    const supabase = this.getSupabaseStorageClient();
    const bucket = process.env.SUPABASE_ATESTADOS_BUCKET || "atestados";

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(atestado.arquivo_url, 60 * 60);

    if (error || !data?.signedUrl) {
      throw new BadRequestException(
        error?.message || "Não foi possível gerar o link do arquivo.",
      );
    }

    return {
      url: data.signedUrl,
    };
  }
}
