import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Clock,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Timer,
  PackageCheck,
  Truck,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";

type UserData = {
  matricula: string;
  nome: string;
  cargo?: string | null;
};

type DashboardStats = {
  entregasHoje?: number | null;
  entregasSemana?: number | null;
  pacotesRecebidos?: number | null;
  horasTrabalhadas?: string | null;
  statusPonto?: "fora" | "trabalhando" | "pausa" | null;
  ultimaEntrada?: string | null;
  ultimaSaida?: string | null;
  tempoPausa?: string | null;
};

type RecentActivity = {
  id: string | number;
  tipo: "entrega" | "pacote" | "ponto";
  descricao: string;
  horario?: string | null;
  status?: "success" | "info" | "warning" | "error";
};

type DashboardOverviewProps = {
  userData: UserData;
  dashboardData?: {
    stats?: DashboardStats | null;
    recentActivities?: RecentActivity[] | null;
  } | null;
  isLoading?: boolean;
};

function formatarStatusPonto(status?: DashboardStats["statusPonto"]) {
  switch (status) {
    case "trabalhando":
      return {
        label: "Trabalhando",
        badge: "Ativo",
        badgeClass: "bg-green-600 text-white",
      };
    case "pausa":
      return {
        label: "Em Pausa",
        badge: "Pausado",
        badgeClass: "bg-yellow-500 text-white",
      };
    case "fora":
      return {
        label: "Fora do Expediente",
        badge: "Inativo",
        badgeClass: "bg-slate-200 text-slate-700",
      };
    default:
      return {
        label: "Sem informação",
        badge: "Indisponível",
        badgeClass: "bg-slate-200 text-slate-700",
      };
  }
}

function valorOuTraco(
  valor?: string | number | null,
  fallback = "-",
): string | number {
  if (valor === null || valor === undefined || valor === "") return fallback;
  return valor;
}

export function DashboardOverview({
  userData,
  dashboardData,
  isLoading = false,
}: DashboardOverviewProps) {
  const stats = dashboardData?.stats ?? null;
  const recentActivities = dashboardData?.recentActivities ?? [];

  const statusPonto = formatarStatusPonto(stats?.statusPonto);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg">
          <h2 className="mb-2 text-2xl font-bold">
            Bem-vindo, {(userData?.nome || "").split(" ")[0]}!
          </h2>

          <p className="text-blue-100">
            {userData.cargo || "Cargo não informado"} - Matrícula{" "}
            {userData.matricula}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Calendar className="size-4" />
            <span className="text-sm text-blue-100">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Carregando informações do dashboard...
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Entregas Hoje
              </CardTitle>
              <Package className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {valorOuTraco(stats?.entregasHoje)}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Dados reais do sistema
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Entregas na Semana
              </CardTitle>
              <Truck className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {valorOuTraco(stats?.entregasSemana)}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Dados reais do sistema
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Pacotes Recebidos
              </CardTitle>
              <PackageCheck className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {valorOuTraco(stats?.pacotesRecebidos)}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Dados reais do sistema
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Horas Trabalhadas
              </CardTitle>
              <Timer className="size-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {valorOuTraco(stats?.horasTrabalhadas)}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Dados reais do sistema
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-blue-600" />
                Status do Ponto
              </CardTitle>
              <CardDescription>
                Situação atual do registro de ponto
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Status Atual
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {statusPonto.label}
                  </p>
                </div>

                <Badge className={statusPonto.badgeClass}>
                  {statusPonto.badge}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Última entrada:</span>
                  <span className="font-medium text-slate-900">
                    {valorOuTraco(stats?.ultimaEntrada)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Última saída:</span>
                  <span className="font-medium text-slate-900">
                    {valorOuTraco(stats?.ultimaSaida)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tempo de pausa:</span>
                  <span className="font-medium text-slate-900">
                    {valorOuTraco(stats?.tempoPausa)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-blue-600" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas ações registradas no sistema
              </CardDescription>
            </CardHeader>

            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="py-4 text-sm text-slate-500">
                  Nenhuma atividade recente encontrada.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
                    >
                      <div
                        className={`rounded-full p-2 ${
                          activity.status === "success"
                            ? "bg-green-100"
                            : activity.status === "warning"
                              ? "bg-yellow-100"
                              : activity.status === "error"
                                ? "bg-red-100"
                                : "bg-blue-100"
                        }`}
                      >
                        {activity.tipo === "entrega" && (
                          <CheckCircle2
                            className={`size-4 ${
                              activity.status === "success"
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          />
                        )}

                        {activity.tipo === "pacote" && (
                          <Package className="size-4 text-blue-600" />
                        )}

                        {activity.tipo === "ponto" && (
                          <Clock
                            className={`size-4 ${
                              activity.status === "success"
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.descricao}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {activity.horario || "-"}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
