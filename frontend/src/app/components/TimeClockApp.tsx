import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
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
  const [workStatus, setWorkStatus] = useState<WorkStatus>("fora");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [workedTime, setWorkedTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);

  const funcionarioId = userData.id;
  const deliveriesToday = 12;4
  const [dataAtual, setDataAtual] = useState(new Date());

  useEffect(() => {
  const timer = setInterval(() => {
    const agora = new Date();

    setCurrentTime(agora);

    // detecta virada de dia
    if (
      agora.getDate() !== dataAtual.getDate() ||
      agora.getMonth() !== dataAtual.getMonth() ||
      agora.getFullYear() !== dataAtual.getFullYear()
    ) {
      console.log("🔄 Virou o dia!");

      setDataAtual(agora);

      // recarrega registros do novo dia
      carregarPontos();
    }
  }, 1000);

  return () => clearInterval(timer);
}, [dataAtual]);

  useEffect(() => {
  const resumo = recalcularResumoDoDia(timeEntries, currentTime);

  setWorkedTime(resumo.workedSeconds);
  setPauseTime(resumo.pauseSeconds);
  setWorkStatus(resumo.statusAtual);
}, [timeEntries, currentTime]);


  useEffect(() => {
    carregarPontos();
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

  const isMesmoDia = (data: Date, referencia: Date) => {
  return (
    data.getDate() === referencia.getDate() &&
    data.getMonth() === referencia.getMonth() &&
    data.getFullYear() === referencia.getFullYear()
  );
};

const recalcularResumoDoDia = (entries: TimeEntry[], agora: Date) => {
  const registrosHoje = [...entries]
    .filter((entry) => isMesmoDia(entry.timestamp, agora))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let segundosTrabalhados = 0;
  let segundosPausa = 0;

  let inicioTrabalho: Date | null = null;
  let inicioPausa: Date | null = null;
  let statusAtual: WorkStatus = "fora";

  for (const entry of registrosHoje) {
    if (entry.type === "entrada") {
      inicioTrabalho = entry.timestamp;
      inicioPausa = null;
      statusAtual = "trabalhando";
    }

    if (entry.type === "pausa_inicio") {
      if (inicioTrabalho) {
        segundosTrabalhados += Math.floor(
          (entry.timestamp.getTime() - inicioTrabalho.getTime()) / 1000
        );
      }

      inicioTrabalho = null;
      inicioPausa = entry.timestamp;
      statusAtual = "pausa";
    }

    if (entry.type === "pausa_fim") {
      if (inicioPausa) {
        segundosPausa += Math.floor(
          (entry.timestamp.getTime() - inicioPausa.getTime()) / 1000
        );
      }

      inicioPausa = null;
      inicioTrabalho = entry.timestamp;
      statusAtual = "trabalhando";
    }

    if (entry.type === "saida") {
      if (inicioTrabalho) {
        segundosTrabalhados += Math.floor(
          (entry.timestamp.getTime() - inicioTrabalho.getTime()) / 1000
        );
      }

      inicioTrabalho = null;
      inicioPausa = null;
      statusAtual = "fora";
    }
  }

  if (statusAtual === "trabalhando" && inicioTrabalho) {
    segundosTrabalhados += Math.floor(
      (agora.getTime() - inicioTrabalho.getTime()) / 1000
    );
  }

  if (statusAtual === "pausa" && inicioPausa) {
    segundosPausa += Math.floor(
      (agora.getTime() - inicioPausa.getTime()) / 1000
    );
  }

  return {
    workedSeconds: Math.max(0, segundosTrabalhados),
    pauseSeconds: Math.max(0, segundosPausa),
    statusAtual,
  };
};

  const mapApiEntriesToUi = (entries: ApiTimeEntry[]): TimeEntry[] => {
  return entries.map((entry) => {
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
  });
};

const carregarPontos = async () => {
  try {
    const response = await fetch(`/api/ponto/${funcionarioId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar registros");
    }

    const registros = mapApiEntriesToUi(data);
    setTimeEntries(registros);

    const resumo = recalcularResumoDoDia(registros, new Date());
    setWorkedTime(resumo.workedSeconds);
    setPauseTime(resumo.pauseSeconds);
    setWorkStatus(resumo.statusAtual);
  } catch (error) {
    console.error(error);
    toast.error("Erro ao carregar registros");
  }
};

const obterLocalizacaoPrecisa = (): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> => {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Geolocalização não suportada neste navegador")
    );
  }

  return new Promise((resolve, reject) => {
    const leituras: Array<{
      latitude: number;
      longitude: number;
      accuracy: number;
    }> = [];

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const leitura = {
          latitude: Number(position.coords.latitude.toFixed(8)),
          longitude: Number(position.coords.longitude.toFixed(8)),
          accuracy: Number(position.coords.accuracy.toFixed(2)),
        };

        console.log("Nova leitura:", leitura);
        console.log(
          "Mapa:",
          `https://www.google.com/maps?q=${leitura.latitude},${leitura.longitude}`
        );

        leituras.push(leitura);

        if (leitura.accuracy <= 30) {
          navigator.geolocation.clearWatch(watchId);
          resolve(leitura);
          return;
        }

        if (leituras.length >= 3) {
          navigator.geolocation.clearWatch(watchId);

          const melhor = [...leituras].sort(
            (a, b) => a.accuracy - b.accuracy
          )[0];

          if (melhor.accuracy > 150) {
            reject(
              new Error(
                `Localização imprecisa (${Math.round(
                  melhor.accuracy
                )}m). Tente no celular com GPS ligado.`
              )
            );
            return;
          }

          resolve(melhor);
        }
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);

        let mensagem = "Não foi possível obter a localização";

        if (error.code === error.PERMISSION_DENIED) {
          mensagem = "Permissão de localização negada";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          mensagem = "Localização indisponível no dispositivo";
        } else if (error.code === error.TIMEOUT) {
          mensagem = "Tempo esgotado ao obter localização";
        }

        reject(new Error(mensagem));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );

    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);

      if (leituras.length === 0) {
        reject(new Error("Nenhuma leitura de localização foi obtida"));
        return;
      }

      const melhor = [...leituras].sort(
        (a, b) => a.accuracy - b.accuracy
      )[0];

      if (melhor.accuracy > 150) {
        reject(
          new Error(
            `Localização imprecisa (${Math.round(
              melhor.accuracy
            )}m). Tente no celular com GPS ligado.`
          )
        );
        return;
      }

      resolve(melhor);
    }, 12000);
  });
};

const registrarPonto = async (
  tipo: "ENTRADA" | "SAIDA" | "SAIDA_ALMOCO" | "VOLTA_ALMOCO"
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

  return data;
};

const handleClockIn = async () => {
  try {
    await registrarPonto("ENTRADA");
    await carregarPontos();
    setWorkStatus("trabalhando");

    toast.success("Entrada registrada com sucesso!", {
      description: formatTime(new Date()),
    });
  } catch (error) {
    console.error(error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível registrar a entrada"
    );
  }
};

const handleClockOut = async () => {
  try {
    await registrarPonto("SAIDA");
    await carregarPontos();
    setWorkStatus("fora");

    toast.success("Saída registrada com sucesso!", {
      description: formatTime(new Date()),
    });
  } catch (error) {
    console.error(error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível registrar a saída"
    );
  }
};

const handlePauseStart = async () => {
  try {
    await registrarPonto("SAIDA_ALMOCO");
    await carregarPontos();
    setWorkStatus("pausa");

    toast.info("Pausa iniciada", {
      description: formatTime(new Date()),
    });
  } catch (error) {
    console.error(error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível iniciar a pausa"
    );
  }
};

const handlePauseEnd = async () => {
  try {
    await registrarPonto("VOLTA_ALMOCO");
    await carregarPontos();
    setWorkStatus("trabalhando");

    toast.info("Pausa finalizada", {
      description: formatTime(new Date()),
    });
  } catch (error) {
    console.error(error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível finalizar a pausa"
    );
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
                      Tem certeza que deseja sair do sistema? Você precisará
                      fazer login novamente para acessar.
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Relógio
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.div
                className="text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 font-mono text-6xl font-bold text-slate-900">
                  {formatTime(currentTime)}
                </div>
                <div className="text-slate-600">{formatDate(currentTime)}</div>
              </motion.div>

              <Separator />

              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {workStatus === "fora" && (
                    <motion.div
                      key="clock-in"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Button
                        onClick={handleClockIn}
                        className="h-14 w-full bg-green-600 text-lg hover:bg-green-700"
                      >
                        <LogIn className="mr-2 size-5" />
                        Registrar Entrada
                      </Button>
                    </motion.div>
                  )}

                  {workStatus === "trabalhando" && (
                    <motion.div
                      key="working"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Button
                        onClick={handlePauseStart}
                        className="h-14 w-full bg-yellow-500 text-lg hover:bg-yellow-600"
                      >
                        <Coffee className="mr-2 size-5" />
                        Iniciar Pausa
                      </Button>
                      <Button
                        onClick={handleClockOut}
                        variant="outline"
                        className="h-14 w-full border-red-600 text-lg text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 size-5" />
                        Registrar Saída
                      </Button>
                    </motion.div>
                  )}

                  {workStatus === "pausa" && (
                    <motion.div
                      key="pause"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Button
                        onClick={handlePauseEnd}
                        className="h-14 w-full bg-blue-600 text-lg hover:bg-blue-700"
                      >
                        <CheckCircle2 className="mr-2 size-5" />
                        Finalizar Pausa
                      </Button>
                      <Button
                        onClick={handleClockOut}
                        variant="outline"
                        className="h-14 w-full border-red-600 text-lg text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 size-5" />
                        Registrar Saída
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="size-5" />
                Resumo do Dia
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="mb-1 text-sm text-green-700">
                    Tempo Trabalhado
                  </div>
                  <div className="font-mono text-2xl font-bold text-green-900">
                    {formatDuration(workedTime)}
                  </div>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="mb-1 text-sm text-yellow-700">
                    Tempo de Pausa
                  </div>
                  <div className="font-mono text-2xl font-bold text-yellow-900">
                    {formatDuration(pauseTime)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Histórico de Hoje
                </h3>

                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {timeEntries.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <Clock className="mx-auto mb-2 size-12 opacity-50" />
                      <p>Nenhum registro hoje</p>
                    </div>
                  ) : (
                    timeEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {getEntryIcon(entry.type)}
                          <span className="font-medium text-slate-900">
                            {getEntryLabel(entry.type)}
                          </span>
                        </div>

                        <span className="font-mono text-sm text-slate-600">
                          {formatTime(entry.timestamp)}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}