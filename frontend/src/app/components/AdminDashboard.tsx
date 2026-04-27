import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  BarChart3,
  Clock3,
  LayoutDashboard,
  Loader2,
  Package,
  Shield,
  UserCheck,
  UserCog,
  Activity,
  ClipboardCheck,
} from "lucide-react";

import { Card, CardContent } from "./ui/card";
import { AdminCertificates } from "./AdminCertificates";
import { PackageManagement } from "./PackageManagement";
import { AdminWarnings } from "./AdminWarnings";
import { EmployeeManagement } from "./EmployeeManagement";
import { AppShell } from "./AppShell";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

type AdminUser = {
  id?: number;
  usuarioId?: number;
  nome?: string;
  matricula?: string;
  cargo?: string;
  perfil?: string;
  email?: string;
  isAdmin?: boolean;
};

type OverviewData = {
  stats?: {
    totalFuncionarios?: number;
    trabalhando?: number;
    emPausa?: number;
    fora?: number;
    taxaPresenca?: number;
    registrosHoje?: number;
    registrosMes?: number;
  };
  weeklyData?: {
    dia: string;
    funcionarios: number;
    horas: number;
  }[];
  topFuncionarios?: {
    nome: string;
    cargo: string;
    horasSemana: string;
    horasDia: string;
  }[];
  alerts?: {
    id: string;
    type: "warning" | "info" | "success";
    message: string;
    time: string;
  }[];
};

type AdminDashboardProps = {
  userData?: AdminUser;
  onLogout: () => void;
};

const adminMenu = [
  { key: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { key: "time", label: "Atestados e Advertências", icon: Clock3 },
  { key: "employees", label: "Funcionários", icon: UserCog },
  { key: "packages", label: "Pacotes", icon: Package },
];

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

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconClassName,
  valueClassName = "text-[#20275b]",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconClassName: string;
  valueClassName?: string;
}) {
  return (
    <Card className="rounded-3xl border-[#e9ebf3] bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${iconClassName}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-[#7b82a8]">{title}</p>
            <h3
              className={`mt-1 text-4xl font-bold tracking-tight ${valueClassName}`}
            >
              {value}
            </h3>
            <p className="mt-1 text-sm text-[#9aa1bf]">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard({ userData, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const storedUser = useMemo(() => getStoredUser(), []);
  const user = userData || storedUser;

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

  const totalFuncionarios = overview?.stats?.totalFuncionarios ?? 0;
  const trabalhandoAgora = overview?.stats?.trabalhando ?? 0;
  const emPausa = overview?.stats?.emPausa ?? 0;
  const registrosHoje = overview?.stats?.registrosHoje ?? 0;
  const taxaPresenca = overview?.stats?.taxaPresenca ?? 0;

  function renderContent() {
    if (activeTab === "time") {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-[#20275b]">
              Ponto e Validações
            </h1>
            <p className="mt-2 text-lg text-[#7b82a8]">
              Valide atestados, acompanhe advertências e revise solicitações dos
              funcionários.
            </p>
          </div>

          <section className="rounded-3xl border border-[#e9ebf3] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#20275b]">Atestados</h2>
                <p className="text-sm text-[#7b82a8]">
                  Valide os atestados enviados pelos funcionários.
                </p>
              </div>
            </div>
            <AdminCertificates />
          </section>

          <section className="rounded-3xl border border-[#e9ebf3] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#20275b]">
                  Advertências
                </h2>
                <p className="text-sm text-[#7b82a8]">
                  Registre e acompanhe advertências internas.
                </p>
              </div>
            </div>
            <AdminWarnings />
          </section>
        </div>
      );
    }

    if (activeTab === "employees") {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-[#20275b]">
              Funcionários
            </h1>
            <p className="mt-2 text-lg text-[#7b82a8]">
              Gerencie cadastro, cargos, setores, jornadas e permissões.
            </p>
          </div>
          <EmployeeManagement />
        </div>
      );
    }

    if (activeTab === "packages") {
      return (
        <div className="space-y-6">
          <PackageManagement />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[32px] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-xl shadow-violet-950/15"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium ring-1 ring-white/20">
                Painel Administrativo
              </p>
              <h1 className="text-5xl font-bold tracking-tight">
                Bem-vindo, {user?.nome || "Administrador"}!
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-white/82">
                Visão geral das operações, presença da equipe e produtividade do
                dia.
              </p>
            </div>

            <div className="hidden rounded-3xl border border-white/20 bg-white/10 p-5 md:block">
              <Shield className="h-12 w-12 text-white/85" />
            </div>
          </div>
        </motion.div>

        {overviewError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {overviewError}
            </div>
          </div>
        )}

        {loadingOverview ? (
          <Card className="rounded-3xl border-[#e9ebf3] shadow-sm">
            <CardContent className="py-16">
              <div className="flex items-center justify-center gap-2 text-[#7b82a8]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando visão geral...
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Funcionários"
                value={totalFuncionarios}
                subtitle="Ativos no sistema"
                icon={<UserCheck className="h-6 w-6" />}
                iconClassName="bg-violet-100 text-violet-600"
              />
              <MetricCard
                title="Trabalhando Agora"
                value={trabalhandoAgora}
                subtitle={`${emPausa} em pausa`}
                icon={<Activity className="h-6 w-6" />}
                iconClassName="bg-green-100 text-green-600"
                valueClassName="text-green-600"
              />
              <MetricCard
                title="Registros Hoje"
                value={registrosHoje}
                subtitle="Batidas registradas hoje"
                icon={<Clock3 className="h-6 w-6" />}
                iconClassName="bg-blue-100 text-blue-600"
              />
              <MetricCard
                title="Taxa de Presença"
                value={`${taxaPresenca}%`}
                subtitle="Hoje"
                icon={<BarChart3 className="h-6 w-6" />}
                iconClassName="bg-orange-100 text-orange-600"
              />
            </div>

            <Card className="rounded-3xl border-[#e9ebf3] bg-white shadow-sm">
              <CardContent className="py-16 text-center text-[#7b82a8]">
                Nenhum dado adicional disponível para exibir no overview.
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <AppShell
      activeKey={activeTab}
      onNavigate={setActiveTab}
      userData={user}
      onLogout={onLogout}
      menuItems={adminMenu}
    >
      {renderContent()}
    </AppShell>
  );
}
