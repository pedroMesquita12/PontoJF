import { useEffect, useMemo, useState } from "react";
import { EmployeeTimeRecords } from "./EmployeeTimeRecords";
import { OverallDevelopment } from "./OverallDevelopment";
import { PackageManagement } from "./PackageManagement";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Shield,
  LogOut,
  BarChart3,
  Clock,
  Package,
  Users,
  UserCheck,
  Activity,
  Loader2,
  AlertCircle,
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
  token?: string;
  accessToken?: string;
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

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

function getToken() {
  try {
    const userData = localStorage.getItem("user");

    if (userData) {
      const user = JSON.parse(userData);
      return user?.token || user?.accessToken || null;
    }

    return localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data || `Erro ${response.status} ao acessar ${url}`
    );
  }

  return data;
}

export function AdminDashboard({ userData, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const isDono = useMemo(() => {
    return (userData.perfil || "").toUpperCase() === "DONO";
  }, [userData.perfil]);

  useEffect(() => {
    const carregarOverview = async () => {
      if (!isDono) {
        setLoadingOverview(false);
        setOverview(null);
        setOverviewError("Apenas o DONO pode acessar esta área.");
        return;
      }

      try {
        setLoadingOverview(true);
        setOverviewError("");

        const hoje = new Date().toISOString().split("T")[0];
        const data = await apiFetch(`/admin/overview?date=${hoje}`);
        setOverview(data as OverviewData);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o painel administrativo.";

        if (
          message.includes("401") ||
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("jwt") ||
          message.toLowerCase().includes("token")
        ) {
          setOverviewError("Sessão expirada. Faça login novamente.");
          return;
        }

        setOverviewError(message);
      } finally {
        setLoadingOverview(false);
      }
    };

    void carregarOverview();
  }, [isDono]);

  const stats = overview?.stats ?? {
    totalFuncionarios: 0,
    trabalhando: 0,
    emPausa: 0,
    fora: 0,
    taxaPresenca: 0,
    registrosHoje: 0,
    registrosMes: 0,
  };

  const handleConfirmLogout = () => {
    setLoggingOut(true);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-600 p-2 text-white">
                <Shield className="size-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Painel Administrativo
                </h1>
                <p className="text-xs text-slate-600">
                  Gestão e monitoramento
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <div className="flex items-center justify-end gap-2">
                  <Badge className="bg-purple-600">
                    {userData.cargo || userData.perfil}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {userData.nome}
                </p>
                <p className="text-xs text-slate-600">
                  Mat. {userData.matricula}
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Deseja sair do sistema?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Você será desconectado e precisará fazer login novamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={loggingOut}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirmLogout}
                      disabled={loggingOut}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {loggingOut ? "Saindo..." : "Confirmar saída"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 p-1 lg:inline-grid lg:w-auto">
            <TabsTrigger value="overview" className="gap-2 py-2.5">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>

            <TabsTrigger value="timeclock" className="gap-2 py-2.5">
              <Clock className="size-4" />
              <span>Pontos</span>
            </TabsTrigger>

            <TabsTrigger value="packagemanagement" className="gap-2 py-2.5">
              <Package className="size-4" />
              <span>Pacotes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold">
                      Bem-vindo, {userData.nome.split(" ")[0]}!
                    </h2>
                    <p className="text-purple-100">
                      Visão geral das operações e desempenho da equipe
                    </p>
                  </div>
                  <Shield className="size-12 opacity-50" />
                </div>
              </div>
            </motion.div>

            {loadingOverview && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Carregando informações do painel...
                </div>
              </div>
            )}

            {overviewError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  {overviewError}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Funcionários
                  </CardTitle>
                  <Users className="size-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.totalFuncionarios}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Ativos no sistema
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Trabalhando Agora
                  </CardTitle>
                  <UserCheck className="size-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.trabalhando}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <Activity className="size-3" />
                    {stats.emPausa} em pausa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Registros Hoje
                  </CardTitle>
                  <Clock className="size-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.registrosHoje}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Batidas registradas hoje
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Taxa de Presença
                  </CardTitle>
                  <BarChart3 className="size-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.taxaPresenca}%
                  </div>
                  <p className="mt-1 text-xs text-slate-600">Hoje</p>
                </CardContent>
              </Card>
            </div>

            {loadingOverview ? (
              <Card>
                <CardContent className="py-10">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="size-4 animate-spin" />
                    Carregando visão geral...
                  </div>
                </CardContent>
              </Card>
            ) : overview ? (
              <OverallDevelopment overview={overview} />
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-slate-500">
                  Nenhum dado disponível para exibir no overview.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeclock">
            {isDono ? (
              <EmployeeTimeRecords />
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-slate-500">
                  Apenas o DONO pode acessar os registros de ponto administrativos.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="packagemanagement">
            {isDono ? (
              <PackageManagement />
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-slate-500">
                  Apenas o DONO pode acessar a gestão de pacotes.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}