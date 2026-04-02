import { useEffect, useState } from "react";
import { EmployeeTimeRecords } from "./EmployeeTimeRecords";
import { OverallDevelopment } from "./OverallDevelopment";
import { PackageManagement } from "./PackageManagement";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Shield,
  LogOut,
  BarChart3,
  Clock,
  Package,
  Users,
  UserCheck,
  Activity,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

type UserData = {
  id: number;
  usuarioId: number;
  matricula: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: string;
  isAdmin: boolean;
};

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

type AdminDashboardProps = {
  userData: UserData;
  onLogout: () => void;
};

const API_URL = "/api";

export function AdminDashboard({ userData, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);

  useEffect(() => {
    const carregarOverview = async () => {
      try {
        const hoje = new Date().toISOString().split("T")[0];
        const response = await fetch(`${API_URL}/admin/overview?date=${hoje}`);

        if (!response.ok) {
          throw new Error("Erro ao carregar overview");
        }

        const data = await response.json();
        setOverview(data);
      } catch (error) {
        console.error(error);
      }
    };

    carregarOverview();
  }, []);

  const stats = overview?.stats ?? {
    totalFuncionarios: 0,
    trabalhando: 0,
    emPausa: 0,
    fora: 0,
    taxaPresenca: 0,
    registrosHoje: 0,
    registrosMes: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 text-white p-2 rounded-lg">
                <Shield className="size-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Painel Administrativo</h1>
                <p className="text-xs text-slate-600">Gestão e Monitoramento</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600">{userData.cargo || userData.perfil}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-900">{userData.nome}</p>
                <p className="text-xs text-slate-600">Mat. {userData.matricula}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid h-auto p-1">
            <TabsTrigger value="overview" className="gap-2 py-2.5">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Desenvolvimento Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="timeclock" className="gap-2 py-2.5">
              <Clock className="size-4" />
              <span className="hidden sm:inline">Pontos</span>
              <span className="sm:hidden">Pontos</span>
            </TabsTrigger>
            <TabsTrigger value="packagemanagement" className="gap-2 py-2.5">
              <Package className="size-4" />
              <span className="hidden sm:inline">Pacotes</span>
              <span className="sm:hidden">Pacotes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Bem-vindo, {userData.nome.split(" ")[0]}!</h2>
                    <p className="text-purple-100">Visão geral das operações e desempenho da equipe</p>
                  </div>
                  <Shield className="size-12 opacity-50" />
                </div>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Funcionários</CardTitle>
                  <Users className="size-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalFuncionarios}</div>
                  <p className="text-xs text-slate-600 mt-1">Ativos no sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Trabalhando Agora</CardTitle>
                  <UserCheck className="size-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.trabalhando}</div>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <Activity className="size-3" />
                    {stats.emPausa} em pausa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Registros Hoje</CardTitle>
                  <Clock className="size-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.registrosHoje}</div>
                  <p className="text-xs text-slate-600 mt-1">Batidas registradas hoje</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Taxa de Presença</CardTitle>
                  <BarChart3 className="size-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.taxaPresenca}%</div>
                  <p className="text-xs text-slate-600 mt-1">Hoje</p>
                </CardContent>
              </Card>
            </div>

            <OverallDevelopment overview={overview} />
          </TabsContent>

          <TabsContent value="timeclock">
            <EmployeeTimeRecords />
          </TabsContent>

          <TabsContent value="packagemanagement">
            <PackageManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}