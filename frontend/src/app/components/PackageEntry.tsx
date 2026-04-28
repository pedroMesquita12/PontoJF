import { useEffect, useMemo, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Package,
  Scan,
  CheckCircle2,
  PackageCheck,
  User,
  MapPin,
  Hash,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

type UserData = {
  matricula: string;
  nome: string;
  cargo: string;
};

type PackageEntryProps = {
  userData: UserData;
};

type PackageItem = {
  id: number | string;
  codigo: string;
  destinatario: string;
  endereco: string;
  createdAt?: string;
  timestamp?: Date;
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

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
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

export function PackageEntry({ userData }: PackageEntryProps) {
  const [codigo, setCodigo] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [endereco, setEndereco] = useState("");
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  async function loadPackages() {
    try {
      const data = await apiFetch("/admin/pacotes");

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.pacotes)
            ? data.pacotes
            : [];

      setPackages(list);
    } catch {
      setPackages([]);
    }
  }

  useEffect(() => {
    void loadPackages();

    return () => {
      void stopScanner();
    };
  }, []);

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      scannerRef.current = null;
    } finally {
      setIsScanning(false);
    }
  }

  function handleScan() {
  setIsScanning(true);

  setTimeout(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "package-reader",
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        const scannedValue = decodedText.trim();

        if (!scannedValue) return;

        try {
          const parsed = JSON.parse(scannedValue);

          setCodigo(parsed.codigo || "");
          setDestinatario(parsed.destinatario || "");
          setEndereco(parsed.endereco || "");

          toast.success("Dados do pacote escaneados com sucesso!");
        } catch {
          setCodigo(scannedValue);
          toast.success("Código escaneado. Preencha destinatário e endereço.");
        }

        await stopScanner();
      },
      () => {},
    );
  }, 250);
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!codigo.trim()) {
      toast.error("Escaneie ou digite o código do pacote.");
      return;
    }

    if (!destinatario.trim() || !endereco.trim()) {
      toast.error("Preencha destinatário e endereço.");
      return;
    }

    try {
      setSaving(true);

      const novoPacote = await apiFetch("/admin/pacotes/entrada", {
        method: "POST",
        body: JSON.stringify({
          codigo: codigo.trim(),
          destinatario: destinatario.trim(),
          endereco: endereco.trim(),
          prioridade: "NORMAL",
        }),
      });

      toast.success("Pacote registrado com sucesso!", {
        description: `Código: ${codigo}`,
      });

      setPackages((prev) => [novoPacote, ...prev]);

      setCodigo("");
      setDestinatario("");
      setEndereco("");

      await loadPackages();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao registrar pacote.",
      );
    } finally {
      setSaving(false);
    }
  }

  function formatTimestamp(value?: string | Date) {
    const date = value ? new Date(value) : new Date();

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();

    return packages.filter((pkg) => {
      const date = pkg.createdAt || pkg.timestamp;
      if (!date) return false;
      return new Date(date).toDateString() === today;
    }).length;
  }, [packages]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Entrada de Pacotes
          </h2>
          <p className="mt-1 text-slate-600">
            Registre pacotes recebidos no sistema
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Package className="size-4" />
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {todayCount}
            </div>
            <p className="mt-1 text-xs text-slate-600">Pacotes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <PackageCheck className="size-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {packages.length}
            </div>
            <p className="mt-1 text-xs text-slate-600">Todos os registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <User className="size-4" />
              Operador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="truncate text-lg font-bold text-slate-900">
              {userData.nome}
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Mat. {userData.matricula}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5 text-blue-600" />
            Registrar Novo Pacote
          </CardTitle>
          <CardDescription>
            Preencha as informações ou escaneie o código de barras/QR Code
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Pacote</Label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="codigo"
                    placeholder="Escaneie ou digite o código"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="pl-10"
                    disabled={isScanning}
                  />
                </div>

                {!isScanning ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleScan}
                    disabled={isScanning}
                    className="gap-2"
                  >
                    <Scan className="size-4" />
                    Escanear
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopScanner}
                    className="gap-2"
                  >
                    <X className="size-4" />
                    Fechar
                  </Button>
                )}
              </div>
            </div>

            {isScanning && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div
                  id="package-reader"
                  className="overflow-hidden rounded-xl"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="destinatario"
                  placeholder="Nome completo"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço de Entrega</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="endereco"
                  placeholder="Rua, número, bairro"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full gap-2 text-base"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <PackageCheck className="size-5" />
              )}
              Registrar Pacote
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pacotes Registrados Recentemente</CardTitle>
          <CardDescription>
            Últimos {packages.length}{" "}
            {packages.length === 1
              ? "pacote registrado"
              : "pacotes registrados"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {packages.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 size-12 text-slate-300" />
              <p className="text-slate-600">Nenhum pacote registrado ainda</p>
              <p className="mt-1 text-sm text-slate-500">
                Comece registrando um novo pacote acima
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {packages.slice(0, 10).map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="rounded-lg bg-green-100 p-2">
                      <CheckCircle2 className="size-5 text-green-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono font-semibold text-slate-900">
                          {pkg.codigo}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Registrado
                        </Badge>
                      </div>

                      <p className="font-medium text-slate-900">
                        {pkg.destinatario}
                      </p>

                      <div className="mt-1 flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="mt-0.5 size-4 flex-shrink-0" />
                        <span>{pkg.endereco}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-600">Registrado em</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">
                        {formatTimestamp(pkg.createdAt || pkg.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
