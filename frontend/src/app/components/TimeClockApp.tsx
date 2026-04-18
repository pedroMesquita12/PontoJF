import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EmployeeCertificates } from "./EmployeeCertificates";
import { EmployeeOvertime } from "./EmployeeOvertime";
import { EmployeeWarnings } from "./EmployeeWarnings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  User,
  Calendar,
  Package,
  Timer,
  CheckCircle2,
  AlertCircle,
  Power,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type TimeEntry = {
  id: string;
  type: "entrada" | "saida" | "pausa_inicio" | "pausa_fim";
  timestamp: Date;
};

type ApiTimeEntry = {
  id: number | string;
  tipo: "ENTRADA" | "SAIDA" | "SAIDA_ALMOCO" | "VOLTA_ALMOCO";
  data_hora: string;
};

type WorkStatus = "fora" | "trabalhando" | "pausa";

type DaySummary = {
  workedSeconds: number;
  pauseSeconds: number;
  statusAtual: WorkStatus;
};

type UserData = {
  id: number;
  usuarioId: number;
  matricula: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: string;
};

type TimeClockAppProps = {
  userData: UserData;
  onLogout: () => void;
  hideHeader?: boolean;
};

export function TimeClockApp({
  userData,
  onLogout,
  hideHeader = false,
}: TimeClockAppProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const funcionarioId = userData.id;
  const deliveriesToday = 12;
  const [dataAtual, setDataAtual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date();
      setCurrentTime(agora);

      const virouODia =
        agora.getDate() !== dataAtual.getDate() ||
        agora.getMonth() !== dataAtual.getMonth() ||
        agora.getFullYear() !== dataAtual.getFullYear();

      if (virouODia) {
        setDataAtual(agora);
        void carregarPontos();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dataAtual]);

  useEffect(() => {
    void carregarPontos();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const recalcularResumoDoDia = (
    entries: TimeEntry[],
    agora: Date,
  ): DaySummary => {
    const registrosOrdenados = [...entries].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    let segundosTrabalhados = 0;
    let segundosPausa = 0;

    let inicioTrabalho: Date | null = null;
    let inicioPausa: Date | null = null;
    let statusAtual: WorkStatus = "fora";

    for (const entry of registrosOrdenados) {
      if (entry.type === "entrada") {
        inicioTrabalho = entry.timestamp;
        inicioPausa = null;
        statusAtual = "trabalhando";
      }

      if (entry.type === "pausa_inicio") {
        if (inicioTrabalho) {
          segundosTrabalhados += Math.floor(
            (entry.timestamp.getTime() - inicioTrabalho.getTime()) / 1000,
          );
        }

        inicioTrabalho = null;
        inicioPausa = entry.timestamp;
        statusAtual = "pausa";
      }

      if (entry.type === "pausa_fim") {
        if (inicioPausa) {
          segundosPausa += Math.floor(
            (entry.timestamp.getTime() - inicioPausa.getTime()) / 1000,
          );
        }

        inicioPausa = null;
        inicioTrabalho = entry.timestamp;
        statusAtual = "trabalhando";
      }

      if (entry.type === "saida") {
        if (inicioTrabalho) {
          segundosTrabalhados += Math.floor(
            (entry.timestamp.getTime() - inicioTrabalho.getTime()) / 1000,
          );
        }

        inicioTrabalho = null;
        inicioPausa = null;
        statusAtual = "fora";
      }
    }

    if (statusAtual === "trabalhando" && inicioTrabalho) {
      segundosTrabalhados += Math.floor(
        (agora.getTime() - inicioTrabalho.getTime()) / 1000,
      );
    }

    if (statusAtual === "pausa" && inicioPausa) {
      segundosPausa += Math.floor(
        (agora.getTime() - inicioPausa.getTime()) / 1000,
      );
    }

    return {
      workedSeconds: Math.max(0, segundosTrabalhados),
      pauseSeconds: Math.max(0, segundosPausa),
      statusAtual,
    };
  };

  const resumo = useMemo<DaySummary>(() => {
    return recalcularResumoDoDia(timeEntries, currentTime);
  }, [timeEntries, currentTime]);

  const workedTime = resumo.workedSeconds;
  const pauseTime = resumo.pauseSeconds;
  const workStatus: WorkStatus = resumo.statusAtual;

  const mapApiEntryToUi = (entry: ApiTimeEntry): TimeEntry => {
    let type: TimeEntry["type"] = "entrada";

    if (entry.tipo === "ENTRADA") type = "entrada";
    else if (entry.tipo === "SAIDA") type = "saida";
    else if (entry.tipo === "SAIDA_ALMOCO") type = "pausa_inicio";
    else if (entry.tipo === "VOLTA_ALMOCO") type = "pausa_fim";

    return {
      id: String(entry.id),
      type,
      timestamp: new Date(entry.data_hora),
    };
  };

  const mapApiEntriesToUi = (entries: ApiTimeEntry[]): TimeEntry[] => {
    return entries.map(mapApiEntryToUi);
  };

  const carregarPontos = async () => {
    try {
      setIsLoadingEntries(true);

      const response = await fetch(`/api/ponto/${funcionarioId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar registros");
      }

      const registros = mapApiEntriesToUi(data);
      setTimeEntries(registros);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar registros");
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const obterLocalizacaoPrecisa = (): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  }> => {
    if (!navigator.geolocation) {
      return Promise.reject(
        new Error("Geolocalização não suportada neste navegador"),
      );
    }

    return new Promise((resolve, reject) => {
      const leituras: Array<{
        latitude: number;
        longitude: number;
        accuracy: number;
      }> = [];

      let resolvido = false;

      const finalizar = (callback: () => void, watchId: number) => {
        if (resolvido) return;
        resolvido = true;
        navigator.geolocation.clearWatch(watchId);
        callback();
      };

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const leitura = {
            latitude: Number(position.coords.latitude.toFixed(8)),
            longitude: Number(position.coords.longitude.toFixed(8)),
            accuracy: Number(position.coords.accuracy.toFixed(2)),
          };

          leituras.push(leitura);

          if (leitura.accuracy <= 30) {
            finalizar(() => resolve(leitura), watchId);
            return;
          }

          if (leituras.length >= 3) {
            const melhor = [...leituras].sort(
              (a, b) => a.accuracy - b.accuracy,
            )[0];

            if (melhor.accuracy > 150) {
              finalizar(
                () =>
                  reject(
                    new Error(
                      `Localização imprecisa (${Math.round(
                        melhor.accuracy,
                      )}m). Tente no celular com GPS ligado.`,
                    ),
                  ),
                watchId,
              );
              return;
            }

            finalizar(() => resolve(melhor), watchId);
          }
        },
        (error) => {
          let mensagem = "Não foi possível obter a localização";

          if (error.code === error.PERMISSION_DENIED) {
            mensagem = "Permissão de localização negada";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            mensagem = "Localização indisponível no dispositivo";
          } else if (error.code === error.TIMEOUT) {
            mensagem = "Tempo esgotado ao obter localização";
          }

          finalizar(() => reject(new Error(mensagem)), watchId);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 20000,
        },
      );

      setTimeout(() => {
        if (resolvido) return;

        if (leituras.length === 0) {
          finalizar(
            () =>
              reject(new Error("Nenhuma leitura de localização foi obtida")),
            watchId,
          );
          return;
        }

        const melhor = [...leituras].sort((a, b) => a.accuracy - b.accuracy)[0];

        if (melhor.accuracy > 150) {
          finalizar(
            () =>
              reject(
                new Error(
                  `Localização imprecisa (${Math.round(
                    melhor.accuracy,
                  )}m). Tente no celular com GPS ligado.`,
                ),
              ),
            watchId,
          );
          return;
        }

        finalizar(() => resolve(melhor), watchId);
      }, 12000);
    });
  };

  const registrarPonto = async (
    tipo: "ENTRADA" | "SAIDA" | "SAIDA_ALMOCO" | "VOLTA_ALMOCO",
  ) => {
    const { latitude, longitude, accuracy } = await obterLocalizacaoPrecisa();

    const response = await fetch(`/api/ponto/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        funcionarioId,
        tipo,
        latitude,
        longitude,
        accuracy,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao registrar ponto");
    }

    return data as ApiTimeEntry;
  };

  const adicionarRegistroLocal = (novoRegistroApi: ApiTimeEntry) => {
    const novoRegistro = mapApiEntryToUi(novoRegistroApi);

    setTimeEntries((prev) => {
      return [...prev, novoRegistro].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );
    });
  };

  const handleClockIn = async () => {
    try {
      setIsSubmitting(true);
      const novoRegistro = await registrarPonto("ENTRADA");
      adicionarRegistroLocal(novoRegistro);

      toast.success("Entrada registrada com sucesso!", {
        description: formatTime(new Date()),
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a entrada",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setIsSubmitting(true);
      const novoRegistro = await registrarPonto("SAIDA");
      adicionarRegistroLocal(novoRegistro);

      toast.success("Saída registrada com sucesso!", {
        description: formatTime(new Date()),
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a saída",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseStart = async () => {
    try {
      setIsSubmitting(true);
      const novoRegistro = await registrarPonto("SAIDA_ALMOCO");
      adicionarRegistroLocal(novoRegistro);

      toast.info("Pausa iniciada", {
        description: formatTime(new Date()),
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a pausa",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseEnd = async () => {
    try {
      setIsSubmitting(true);
      const novoRegistro = await registrarPonto("VOLTA_ALMOCO");
      adicionarRegistroLocal(novoRegistro);

      toast.info("Pausa finalizada", {
        description: formatTime(new Date()),
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar a pausa",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (workStatus) {
      case "trabalhando":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-1 size-3" />
            Trabalhando
          </Badge>
        );
      case "pausa":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Coffee className="mr-1 size-3" />
            Em Pausa
          </Badge>
        );
      case "fora":
        return (
          <Badge variant="secondary">
            <AlertCircle className="mr-1 size-3" />
            Fora do Expediente
          </Badge>
        );
    }
  };

  const getEntryIcon = (type: TimeEntry["type"]) => {
    switch (type) {
      case "entrada":
        return <LogIn className="size-4 text-green-600" />;
      case "saida":
        return <LogOut className="size-4 text-red-600" />;
      case "pausa_inicio":
        return <Coffee className="size-4 text-yellow-600" />;
      case "pausa_fim":
        return <CheckCircle2 className="size-4 text-blue-600" />;
    }
  };

  const getEntryLabel = (type: TimeEntry["type"]) => {
    switch (type) {
      case "entrada":
        return "Entrada";
      case "saida":
        return "Saída";
      case "pausa_inicio":
        return "Início de Pausa";
      case "pausa_fim":
        return "Fim de Pausa";
    }
  };

return (
  <div className="min-h-screen p-4 md:p-8">
    <div className="mx-auto max-w-6xl space-y-6">

      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-3 text-white">
              <Package className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Express Encomendas
              </h1>
              <p className="text-sm text-slate-600">
                Sistema de Ponto Eletrônico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Power className="mr-2 size-4" />
                  Sair
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirmar saída do sistema
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja sair do sistema?
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, sair
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* CARD USUÁRIO */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-slate-200 p-3">
                <User className="size-8 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {userData.nome}
                </h2>
                <p className="text-slate-600">
                  {userData.cargo} • Matrícula: {userData.matricula}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-1 flex items-center gap-2 text-slate-600">
                <Calendar className="size-4" />
                <span className="text-sm">{formatDate(currentTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Package className="size-4" />
                <span className="text-sm font-medium">
                  {deliveriesToday} entregas hoje
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="registro" className="space-y-6">

        <TabsList className="grid w-full grid-cols-4 rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="registro">Registrar Ponto</TabsTrigger>
          <TabsTrigger value="atestados">Atestados</TabsTrigger>
          <TabsTrigger value="extras">Horas Extras</TabsTrigger>
          <TabsTrigger value="advertencias">Advertências</TabsTrigger>
        </TabsList>

        {/* ABA PRINCIPAL */}
        <TabsContent value="registro">
          <div className="grid gap-6 md:grid-cols-2">

            {/* RELÓGIO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Relógio
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <motion.div className="text-center">
                  <div className="mb-2 font-mono text-6xl font-bold text-slate-900">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-slate-600">
                    {formatDate(currentTime)}
                  </div>
                </motion.div>

                <Separator />

                <div className="space-y-3">
                  {workStatus === "fora" && (
                    <Button onClick={handleClockIn} className="h-14 w-full bg-green-600 text-lg">
                      Registrar Entrada
                    </Button>
                  )}

                  {workStatus === "trabalhando" && (
                    <>
                      <Button onClick={handlePauseStart} className="h-14 w-full bg-yellow-500 text-lg">
                        Pausa
                      </Button>
                      <Button onClick={handleClockOut} className="h-14 w-full border-red-600 text-lg">
                        Saída
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RESUMO */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Dia</CardTitle>
              </CardHeader>

              <CardContent>
                <p>Tempo Trabalhado: {formatDuration(workedTime)}</p>
                <p>Tempo Pausa: {formatDuration(pauseTime)}</p>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* NOVAS TELAS */}
        <TabsContent value="atestados">
          <EmployeeCertificates />
        </TabsContent>

        <TabsContent value="extras">
          <EmployeeOvertime />
        </TabsContent>

        <TabsContent value="advertencias">
          <EmployeeWarnings />
        </TabsContent>

      </Tabs>
    </div>
  </div>
);
}
