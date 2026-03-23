import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Clock,
  Package,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Timer,
  PackageCheck,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";

type UserData = {
  matricula: string;
  nome: string;
  cargo: string;
};

type DashboardOverviewProps = {
  userData: UserData;
};

export function DashboardOverview({ userData }: DashboardOverviewProps) {
  // Mock data
  const stats = {
    entregasHoje: 12,
    entregasSemana: 58,
    pacotesRecebidos: 145,
    horasTrabalhadas: "6h 32min",
    statusPonto: "fora",
    metaMensal: 75, // porcentagem
  };

  const recentActivities = [
    { id: 1, type: "entrega", description: "Entrega #1234 concluída", time: "14:32", status: "success" },
    { id: 2, type: "pacote", description: "Pacote #5678 recebido", time: "13:15", status: "info" },
    { id: 3, type: "ponto", description: "Registro de entrada", time: "08:00", status: "success" },
    { id: 4, type: "entrega", description: "Entrega #1233 concluída", time: "Ontem", status: "success" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo, {userData.nome.split(' ')[0]}! 👋</h2>
          <p className="text-blue-100">
            {userData.cargo} - Matrícula {userData.matricula}
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

      {/* Stats Grid */}
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
              <div className="text-2xl font-bold text-slate-900">{stats.entregasHoje}</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="size-3" />
                +15% vs ontem
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
              <div className="text-2xl font-bold text-slate-900">{stats.entregasSemana}</div>
              <p className="text-xs text-slate-600 mt-1">
                Meta: {stats.metaMensal}%
              </p>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{ width: `${stats.metaMensal}%` }}
                />
              </div>
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
              <div className="text-2xl font-bold text-slate-900">{stats.pacotesRecebidos}</div>
              <p className="text-xs text-slate-600 mt-1">Este mês</p>
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
              <div className="text-2xl font-bold text-slate-900">{stats.horasTrabalhadas}</div>
              <p className="text-xs text-slate-600 mt-1">Hoje</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status do Ponto */}
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
              <CardDescription>Situação atual do registro de ponto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-600">Status Atual</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {stats.statusPonto === "fora" ? "Fora do Expediente" : "Trabalhando"}
                  </p>
                </div>
                <Badge
                  variant={stats.statusPonto === "fora" ? "secondary" : "default"}
                  className={
                    stats.statusPonto === "fora"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-green-600 text-white"
                  }
                >
                  {stats.statusPonto === "fora" ? "Inativo" : "Ativo"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Última entrada:</span>
                  <span className="font-medium text-slate-900">08:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Última saída:</span>
                  <span className="font-medium text-slate-900">17:30</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tempo de pausa:</span>
                  <span className="font-medium text-slate-900">45 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividades Recentes */}
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
              <CardDescription>Últimas ações registradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {activity.type === "entrega" && (
                        <CheckCircle2
                          className={`size-4 ${
                            activity.status === "success"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        />
                      )}
                      {activity.type === "pacote" && (
                        <Package className="size-4 text-blue-600" />
                      )}
                      {activity.type === "ponto" && (
                        <Clock className="size-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as funções principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Clock className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Registrar Ponto</p>
                  <p className="text-xs text-slate-600">Entrada/Saída</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Package className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Registrar Entrega</p>
                  <p className="text-xs text-slate-600">Nova entrega</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <PackageCheck className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Entrada de Pacote</p>
                  <p className="text-xs text-slate-600">Novo pacote</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
