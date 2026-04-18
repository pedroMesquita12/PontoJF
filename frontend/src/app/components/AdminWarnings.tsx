import { useEffect, useState } from "react";
import { AlertCircle, TriangleAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("token");
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
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
    throw new Error(
      typeof data === "string" ? data : data?.message || "Erro na requisição",
    );
  }

  return data;
}

type Advertencia = {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  tipo: string;
  motivo: string;
  descricao?: string;
  dataAdvertencia: string;
};

type Funcionario = {
  id: number;
  nome: string;
  matricula: string;
};

export function AdminWarnings() {
  const [items, setItems] = useState<Advertencia[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    funcionario_id: "",
    tipo: "",
    motivo: "",
    descricao: "",
    data_advertencia: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [advertencias, employees] = await Promise.all([
        apiFetch("/admin/advertencias"),
        apiFetch("/admin/funcionarios"),
      ]);

      setItems(advertencias);
      setFuncionarios(
        employees.map((f: any) => ({
          id: f.id,
          nome: f.nome,
          matricula: f.matricula,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar advertências.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      await apiFetch("/admin/advertencias", {
        method: "POST",
        body: JSON.stringify({
          funcionario_id: Number(form.funcionario_id),
          tipo: form.tipo,
          motivo: form.motivo,
          descricao: form.descricao || undefined,
          data_advertencia: form.data_advertencia || undefined,
        }),
      });

      setForm({
        funcionario_id: "",
        tipo: "",
        motivo: "",
        descricao: "",
        data_advertencia: "",
      });

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar advertência.");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4" />
            {error}
          </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Nova advertência</h3>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Funcionário</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={form.funcionario_id}
                onChange={(e) =>
                  setForm({ ...form, funcionario_id: e.target.value })
                }
                required
              >
                <option value="">Selecione</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} - {f.matricula}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                placeholder="Ex.: Falta, Atraso, Conduta"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Motivo</Label>
              <Input
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.data_advertencia}
                onChange={(e) =>
                  setForm({ ...form, data_advertencia: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit">Salvar advertência</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-500">
              Carregando advertências...
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-500">
              Nenhuma advertência registrada.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <TriangleAlert className="size-4 text-red-500" />
                  <h3 className="font-semibold">{item.nome}</h3>
                  <span className="text-sm text-slate-500">
                    • {item.matricula} • {item.cargo}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>Tipo: {item.tipo}</p>
                  <p>Motivo: {item.motivo}</p>
                  <p>Descrição: {item.descricao || "Sem descrição"}</p>
                  <p>Data: {item.dataAdvertencia}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}