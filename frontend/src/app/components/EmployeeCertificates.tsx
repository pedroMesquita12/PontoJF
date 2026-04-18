import { useEffect, useState } from "react";
import { AlertCircle, FileText, Upload } from "lucide-react";
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

type Atestado = {
  id: number;
  dataInicio: string;
  dataFim: string;
  dias?: number | null;
  cid?: string;
  observacoes?: string;
  status: string;
  arquivoUrl?: string;
  nomeArquivo?: string;
};

export function EmployeeCertificates() {
  const [items, setItems] = useState<Atestado[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [form, setForm] = useState({
    data_inicio: "",
    data_fim: "",
    dias: "",
    cid: "",
    observacoes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/ponto/me/atestados");
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar atestados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!arquivo) {
      setError("Selecione um arquivo PDF ou imagem do atestado.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("data_inicio", form.data_inicio);
      formData.append("data_fim", form.data_fim);
      formData.append("dias", form.dias);
      formData.append("cid", form.cid);
      formData.append("observacoes", form.observacoes);
      formData.append("arquivo", arquivo);

      const token = getToken();

      const response = await fetch(`${API_URL}/ponto/me/atestados`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          typeof data === "string" ? data : data?.message || "Erro ao enviar atestado",
        );
      }

      setForm({
        data_inicio: "",
        data_fim: "",
        dias: "",
        cid: "",
        observacoes: "",
      });
      setArquivo(null);
      setSuccess("Atestado enviado com sucesso.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar atestado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Enviar atestado</h3>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Data de início</Label>
              <Input
                type="date"
                value={form.data_inicio}
                onChange={(e) =>
                  setForm({ ...form, data_inicio: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data de fim</Label>
              <Input
                type="date"
                value={form.data_fim}
                onChange={(e) =>
                  setForm({ ...form, data_fim: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Dias</Label>
              <Input
                type="number"
                value={form.dias}
                onChange={(e) => setForm({ ...form, dias: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>CID</Label>
              <Input
                value={form.cid}
                onChange={(e) => setForm({ ...form, cid: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Arquivo do atestado</Label>
              <Input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-slate-500">
                Envie PDF, PNG, JPG ou WEBP até 8MB.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) =>
                  setForm({ ...form, observacoes: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                <Upload className="mr-2 size-4" />
                {saving ? "Enviando..." : "Enviar atestado"}
              </Button>
              {success && <span className="text-sm text-emerald-600">{success}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4" />
            {error}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-500">
              Carregando atestados...
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-500">
              Nenhum atestado enviado.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="size-4 text-slate-500" />
                  <h4 className="font-semibold">
                    {item.dataInicio} até {item.dataFim}
                  </h4>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                    {item.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>CID: {item.cid || "Não informado"}</p>
                  <p>Dias: {item.dias ?? "Não informado"}</p>
                  <p>Arquivo: {item.nomeArquivo || "Não informado"}</p>
                  <p>{item.observacoes || "Sem observações"}</p>
                  {item.arquivoUrl && (
                    <a
                      href={`${API_URL}${item.arquivoUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm text-violet-600 hover:underline"
                    >
                      Abrir arquivo
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}