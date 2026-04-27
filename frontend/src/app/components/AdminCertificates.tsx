import { useEffect, useState } from "react";
import { AlertCircle, Check, FileText, Lock, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
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

type AtestadoAdmin = {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  dataInicio: string;
  dataFim: string;
  dias?: number | null;
  cid?: string;
  observacoes?: string;
  status: string;
  nomeArquivo?: string;
  arquivoUrl?: string;
};

function isAtestadoFinalizado(status?: string) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized === "APROVADO" || normalized === "REJEITADO";
}

function getStatusClass(status?: string) {
  const normalized = String(status || "").trim().toUpperCase();

  if (normalized === "APROVADO") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (normalized === "REJEITADO") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}

export function AdminCertificates() {
  const [items, setItems] = useState<AtestadoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [observacoes, setObservacoes] = useState<Record<number, string>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/admin/atestados");
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

  const atualizarStatus = async (
    id: number,
    status: "APROVADO" | "REJEITADO",
  ) => {
    const item = items.find((atestado) => atestado.id === id);

    if (isAtestadoFinalizado(item?.status)) {
      setError("Este atestado já foi analisado e não pode ser alterado novamente.");
      return;
    }

    try {
      setUpdatingId(id);
      setError("");

      await apiFetch(`/admin/atestados/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          observacao: observacoes[id] || "",
        }),
      });

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar atestado.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4" />
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-10 text-center text-slate-500">
            Carregando atestados...
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-10 text-center text-slate-500">
            Nenhum atestado encontrado.
          </CardContent>
        </Card>
      ) : (
        items.map((item) => {
          const finalizado = isAtestadoFinalizado(item.status);
          const atualizando = updatingId === item.id;

          return (
            <Card key={item.id} className="border-slate-200 shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="size-4 text-slate-500" />
                  <h3 className="font-semibold">{item.nome}</h3>
                  <span className="text-sm text-slate-500">
                    • {item.matricula} • {item.cargo}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-semibold ${getStatusClass(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <p>Período: {item.dataInicio} até {item.dataFim}</p>
                  <p>Dias: {item.dias ?? "Não informado"}</p>
                  <p>CID: {item.cid || "Não informado"}</p>
                  <p>Arquivo: {item.nomeArquivo || "Não informado"}</p>
                  <p>{item.observacoes || "Sem observações"}</p>

                  {item.arquivoUrl && (
                    <a
                      href={`${API_URL}${item.arquivoUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-violet-600 hover:underline"
                    >
                      Abrir arquivo
                    </a>
                  )}
                </div>

                <Textarea
                  placeholder={
                    finalizado
                      ? "Atestado já analisado"
                      : "Observação da análise"
                  }
                  value={observacoes[item.id] || ""}
                  disabled={finalizado || atualizando}
                  onChange={(e) =>
                    setObservacoes((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                />

                {finalizado ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <Lock className="size-4" />
                    Este atestado já foi analisado e não pode ser alterado novamente.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={atualizando}
                      onClick={() => atualizarStatus(item.id, "APROVADO")}
                    >
                      <Check className="mr-2 size-4" />
                      {atualizando ? "Salvando..." : "Aprovar"}
                    </Button>

                    <Button
                      variant="destructive"
                      disabled={atualizando}
                      onClick={() => atualizarStatus(item.id, "REJEITADO")}
                    >
                      <X className="mr-2 size-4" />
                      {atualizando ? "Salvando..." : "Rejeitar"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}