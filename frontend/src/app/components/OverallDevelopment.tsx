import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";

type OverviewData = {
  stats: {
    totalFuncionarios: number;
    trabalhando: number;
    emPausa: number;
    fora: number;
    taxaPresenca: number;
    registrosHoje: number;
    registrosMes: number;
  };
  weeklyData: {
    dia: string;
    funcionarios: number;
    horas: number;
  }[];
  topFuncionarios: {
    nome: string;
    cargo: string;
    horasSemana: string;
    horasDia: string;
  }[];
  alerts: {
    id: string;
    type: "warning" | "info" | "success";
    message: string;
    time: string;
  }[];
};

type Props = {
  overview: OverviewData | null;
};

export function OverallDevelopment({ overview }: Props) {
  if (!overview) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-slate-600">
          Carregando visão geral...
        </CardContent>
      </Card>
    );
  }

  const { stats, weeklyData, topFuncionarios, alerts } = overview;
  const maxHoras = Math.max(...weeklyData.map((d) => d.horas), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="size-4" />
              Registros do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.registrosMes}</div>
            <p className="text-xs text-slate-600 mt-1">Total de batidas no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Activity className="size-4" />
              Funcionários Fora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.fora}</div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Status atual
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              Em Pausa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.emPausa}</div>
            <div className="mt-2">
              <p className="text-xs text-slate-600">Funcionários pausados no momento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-blue-600" />
                Desempenho Semanal
              </CardTitle>
              <CardDescription>Horas trabalhadas por dia da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day, index) => (
                  <div key={day.dia} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{day.dia}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-600">{day.funcionarios} funcionários</span>
                        <span className="text-slate-500 text-xs">{day.horas}h trabalhadas</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.horas / maxHoras) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-purple-600" />
                Melhores Desempenhos
              </CardTitle>
              <CardDescription>Top 3 por horas trabalhadas na semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topFuncionarios.map((performer, index) => (
                  <div
                    key={performer.nome}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{performer.nome}</p>
                      <p className="text-xs text-slate-600">{performer.cargo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{performer.horasSemana}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="size-3" />
                        {performer.horasDia} hoje
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-orange-600" />
                Alertas e Notificações
              </CardTitle>
              <CardDescription>Informações importantes do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-200"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        alert.type === "warning"
                          ? "bg-orange-100"
                          : alert.type === "success"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {alert.type === "warning" && (
                        <AlertTriangle className="size-4 text-orange-600" />
                      )}
                      {alert.type === "success" && (
                        <CheckCircle2 className="size-4 text-green-600" />
                      )}
                      {alert.type === "info" && (
                        <Activity className="size-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}