import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  PackageX,
  RefreshCw,
  Search,
  Truck,
  User,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

type PackageStatus = "RECEBIDO" | "EM_ROTA" | "ENTREGUE" | "CANCELADO";
type PackagePriority = "NORMAL" | "URGENTE" | "EXPRESSA";

type PackageItem = {
  id: number | string;
  codigo: string;
  destinatario: string;
  endereco: string;
  status: PackageStatus;
  prioridade: PackagePriority;
  observacao?: string | null;
  responsavelNome?: string | null;
  responsavelMatricula?: string | null;
  createdAt?: string;
  updatedAt?: string;
  entregueEm?: string | null;
};

function getToken() {
  const token = localStorage.getItem("token");
  if (token) return token;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.token || user?.accessToken || user?.access_token || null;
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

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePackage(pkg: any): PackageItem {
  return {
    id: pkg.id,
    codigo: pkg.codigo || "",
    destinatario: pkg.destinatario || "",
    endereco: pkg.endereco || "",
    status: pkg.status || "RECEBIDO",
    prioridade: pkg.prioridade || "NORMAL",
    observacao: pkg.observacao || null,
    responsavelNome:
      pkg.responsavelNome ||
      pkg.usuario?.nome ||
      pkg.funcionario?.nome ||
      pkg.criadoPor?.nome ||
      null,
    responsavelMatricula:
      pkg.responsavelMatricula ||
      pkg.usuario?.matricula ||
      pkg.funcionario?.matricula ||
      pkg.criadoPor?.matricula ||
      null,
    createdAt: pkg.createdAt || pkg.created_at || pkg.criadoEm,
    updatedAt: pkg.updatedAt || pkg.updated_at || pkg.atualizadoEm,
    entregueEm: pkg.entregueEm || pkg.entregue_em || null,
  };
}

function StatusBadge({ status }: { status: PackageStatus }) {
  const config = {
    RECEBIDO: {
      label: "Recebido",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      icon: Package,
    },
    EM_ROTA: {
      label: "Em rota",
      className: "bg-violet-100 text-violet-700 hover:bg-violet-100",
      icon: Truck,
    },
    ENTREGUE: {
      label: "Entregue",
      className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      icon: CheckCircle2,
    },
    CANCELADO: {
      label: "Cancelado",
      className: "bg-red-100 text-red-700 hover:bg-red-100",
      icon: PackageX,
    },
  };

  const item = config[status] || config.RECEBIDO;
  const Icon = item.icon;

  return (
    <Badge className={item.className}>
      <Icon className="mr-1 size-3" />
      {item.label}
    </Badge>
  );
}

function PriorityBadge({ prioridade }: { prioridade: PackagePriority }) {
  const config = {
    NORMAL: "border-slate-200 bg-slate-50 text-slate-700",
    URGENTE: "border-orange-200 bg-orange-50 text-orange-700",
    EXPRESSA: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <Badge variant="outline" className={config[prioridade] || config.NORMAL}>
      {prioridade === "NORMAL"
        ? "Normal"
        : prioridade === "URGENTE"
          ? "Urgente"
          : "Expressa"}
    </Badge>
  );
}

export function PackageManagement() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PackageStatus | "TODOS">(
    "TODOS",
  );

  async function loadPackages() {
    try {
      setLoading(true);

      const data = await apiFetch("/admin/pacotes");

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.pacotes)
            ? data.pacotes
            : [];

      setPackages(list.map(normalizePackage));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar pacotes.",
      );
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPackages();
  }, []);

  const stats = useMemo(() => {
    return {
      total: packages.length,
      recebidos: packages.filter((pkg) => pkg.status === "RECEBIDO").length,
      emRota: packages.filter((pkg) => pkg.status === "EM_ROTA").length,
      entregues: packages.filter((pkg) => pkg.status === "ENTREGUE").length,
      cancelados: packages.filter((pkg) => pkg.status === "CANCELADO").length,
    };
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const term = search.trim().toLowerCase();

    return packages.filter((pkg) => {
      const matchesSearch =
        !term ||
        pkg.codigo.toLowerCase().includes(term) ||
        pkg.destinatario.toLowerCase().includes(term) ||
        pkg.endereco.toLowerCase().includes(term) ||
        String(pkg.responsavelNome || "")
          .toLowerCase()
          .includes(term) ||
        String(pkg.responsavelMatricula || "")
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "TODOS" || pkg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [packages, search, statusFilter]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-gradient-to-r from-slate-950 via-violet-950 to-fuchsia-900 p-8 text-white shadow-sm"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80">
              <PackageCheck className="size-4" />
              Painel administrativo
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Pacotes Registrados
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Visualize todos os pacotes enviados pelos funcionários e acompanhe
              quem registrou cada pacote.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadPackages}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Atualizar
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {stats.total}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Pacotes registrados</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Recebidos</p>
            <h3 className="mt-3 text-3xl font-bold text-blue-600">
              {stats.recebidos}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Aguardando rota</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Em rota</p>
            <h3 className="mt-3 text-3xl font-bold text-violet-600">
              {stats.emRota}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Em andamento</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Entregues</p>
            <h3 className="mt-3 text-3xl font-bold text-emerald-600">
              {stats.entregues}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Finalizados</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Cancelados</p>
            <h3 className="mt-3 text-3xl font-bold text-red-600">
              {stats.cancelados}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Com problema</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por código, destinatário, endereço, funcionário ou matrícula..."
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as PackageStatus | "TODOS")
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="TODOS">Todos os status</option>
              <option value="RECEBIDO">Recebidos</option>
              <option value="EM_ROTA">Em rota</option>
              <option value="ENTREGUE">Entregues</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Pacotes enviados pelos funcionários</CardTitle>
          <CardDescription>
            Exibindo {filteredPackages.length} de {packages.length} pacote(s).
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Carregando pacotes...
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="py-16 text-center">
              <AlertCircle className="mx-auto mb-3 size-10 text-slate-300" />
              <p className="font-medium text-slate-700">
                Nenhum pacote encontrado
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Os pacotes registrados pelos funcionários aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-violet-200 hover:bg-violet-50/30"
                >
                  <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr] xl:items-start">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {pkg.codigo}
                        </span>
                        <StatusBadge status={pkg.status} />
                        <PriorityBadge prioridade={pkg.prioridade} />
                      </div>

                      <p className="font-semibold text-slate-900">
                        {pkg.destinatario || "Destinatário não informado"}
                      </p>

                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="mt-0.5 size-4 shrink-0" />
                        <span>{pkg.endereco || "Endereço não informado"}</span>
                      </div>

                      {pkg.observacao && (
                        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          {pkg.observacao}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Funcionário que registrou
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                          <User className="size-5" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {pkg.responsavelNome || "Não informado"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {pkg.responsavelMatricula
                              ? `Matrícula: ${pkg.responsavelMatricula}`
                              : "Matrícula não informada"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Registrado em</p>
                        <p className="mt-1 flex items-center gap-1 font-medium text-slate-800">
                          <Calendar className="size-3" />
                          {formatDate(pkg.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Última atualização
                        </p>
                        <p className="mt-1 flex items-center gap-1 font-medium text-slate-800">
                          <Clock className="size-3" />
                          {formatDate(pkg.updatedAt)}
                        </p>
                      </div>

                      {pkg.entregueEm && (
                        <div>
                          <p className="text-xs text-slate-500">Entregue em</p>
                          <p className="mt-1 flex items-center gap-1 font-medium text-slate-800">
                            <CheckCircle2 className="size-3" />
                            {formatDate(pkg.entregueEm)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PackageManagement;
