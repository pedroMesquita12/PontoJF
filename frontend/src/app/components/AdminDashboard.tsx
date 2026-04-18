import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  LogOut,
  BarChart3,
  Clock,
  Package,
  UserCog,
  UserCheck,
  Activity,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AdminCertificates } from "./AdminCertificates";
import { AdminWarnings } from "./AdminWarnings";
import { EmployeeManagement } from "./EmployeeManagement";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

type AdminUser = {
  nome?: string;
  matricula?: string;
  perfil?: string;
};

type OverviewData = {
  totalFuncionarios?: number;
  trabalhandoAgora?: number;
  emPausa?: number;
  registrosHoje?: number;
  taxaPresenca?: number;
  funcionarios?: any[];
};

function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getToken() {
  const rawToken = localStorage.getItem("token");
  if (rawToken) return rawToken;

  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);
    return parsed?.token || parsed?.accessToken || parsed?.access_token || null;
  } catch {
    return null;
  }
}

async function apiFetch(path: string) {
  const token = getToken();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || `Erro ${response.status}`;

    throw new Error(message);
  }

  return data;
}

type AdminDashboardProps = {
  onLogout: () => void;
};

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const user = useMemo(() => getStoredUser(), []);

  const loadOverview = async () => {
    try {
      setLoadingOverview(true);
      setOverviewError("");

      const today = new Date().toISOString().split("T")[0];
      const data = await apiFetch(`/admin/overview?date=${today}`);
      setOverview(data);
    } catch (err) {
      setOverviewError(
        err instanceof Error ? err.message : "Falha ao carregar visão geral.",
      );
      setOverview(null);
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      void loadOverview();
    }
  }, [activeTab]);

  const totalFuncionarios = overview?.totalFuncionarios ?? 0;
  const trabalhandoAgora = overview?.trabalhandoAgora ?? 0;
  const emPausa = overview?.emPausa ?? 0;
  const registrosHoje = overview?.registrosHoje ?? 0;
  const taxaPresenca = overview?.taxaPresenca ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white shadow-sm">
              <Shield className="size-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Painel Administrativo
              </h1>
              <p className="text-sm text-slate-500">Gestão e monitoramento</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <Badge className="mb-1 bg-fuchsia-600 hover:bg-fuchsia-600">
                {user?.perfil || "Administrador"}
              </Badge>
              <p className="text-sm font-semibold text-slate-900">
                {user?.nome || "Usuário"}
              </p>
              <p className="text-xs text-slate-500">
                Mat. {user?.matricula || "-"}
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 size-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-xl bg-slate-100 p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 rounded-lg"
            >
              <BarChart3 className="size-4" />
              Visão Geral
            </TabsTrigger>

            <TabsTrigger
              value="time"
              className="flex items-center gap-2 rounded-lg"
            >
              <Clock className="size-4" />
              Pontos
            </TabsTrigger>

            <TabsTrigger
              value="employees"
              className="flex items-center gap-2 rounded-lg"
            >
              <UserCog className="size-4" />
              Funcionários
            </TabsTrigger>

            <TabsTrigger
              value="packages"
              className="flex items-center gap-2 rounded-lg"
            >
              <Package className="size-4" />
              Pacotes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 p-8 text-white shadow-sm"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight">
                    Bem-vindo, {user?.nome || "Administrador"}!
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-fuchsia-50/90">
                    Visão geral das operações e desempenho da equipe.
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-4 md:block">
                  <Shield className="size-10 text-white/80" />
                </div>
              </div>
            </motion.div>

            {overviewError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  {overviewError}
                </div>
              </div>
            )}

            {loadingOverview ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-16">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="size-4 animate-spin" />
                    Carregando visão geral...
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Total Funcionários</p>
                          <h3 className="mt-4 text-4xl font-bold text-slate-900">
                            {totalFuncionarios}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            Ativos no sistema
                          </p>
                        </div>
                        <UserCheck className="size-5 text-fuchsia-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Trabalhando Agora</p>
                          <h3 className="mt-4 text-4xl font-bold text-slate-900">
                            {trabalhandoAgora}
                          </h3>
                          <p className="mt-2 text-sm text-emerald-600">
                            {emPausa} em pausa
                          </p>
                        </div>
                        <Activity className="size-5 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Registros Hoje</p>
                          <h3 className="mt-4 text-4xl font-bold text-slate-900">
                            {registrosHoje}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            Batidas registradas hoje
                          </p>
                        </div>
                        <Clock className="size-5 text-violet-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Taxa de Presença</p>
                          <h3 className="mt-4 text-4xl font-bold text-slate-900">
                            {taxaPresenca}%
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">Hoje</p>
                        </div>
                        <BarChart3 className="size-5 text-rose-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="py-16 text-center text-slate-500">
                    Nenhum dado disponível para exibir no overview.
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="time" className="mt-0 space-y-6">

  {/* ATESTADOS */}
  <Card className="border-slate-200 shadow-sm">
    <CardContent className="py-6">
      <h2 className="text-xl font-bold text-slate-900">
        Atestados
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Valide os atestados enviados pelos funcionários.
      </p>
    </CardContent>
  </Card>

  <AdminCertificates />

 
  <Card className="border-slate-200 shadow-sm">
    <CardContent className="py-6">
      <h2 className="text-xl font-bold text-slate-900">
        Advertências
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Registre advertências para os funcionários.
      </p>
    </CardContent>
  </Card>

  <AdminWarnings />

</TabsContent>

          <TabsContent value="employees" className="mt-0">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="packages" className="mt-0">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-16 text-center text-slate-500">
                Conteúdo da aba de pacotes permanece aqui.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}