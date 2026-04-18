import { useEffect, useState } from "react";
import { AlertCircle, Clock3 } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("token");
}

async function apiFetch(path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "string" ? data : data?.message || "Erro ao carregar horas extras",
    );
  }

  return data;
}

function formatMinutes(total: number) {
  const hours = Math.floor(Math.abs(total) / 60);
  const minutes = Math.abs(total % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function EmployeeOvertime() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await apiFetch("/ponto/me/horas-extras");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar horas extras.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

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
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-slate-500" />
            <h3 className="text-lg font-semibold">Saldo de Horas Extras</h3>
          </div>

          {loading ? (
            <p className="mt-4 text-slate-500">Carregando...</p>
          ) : (
            <p className="mt-4 text-4xl font-bold text-slate-900">
              {data?.saldoTotalFormatado || formatMinutes(0)}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {!loading &&
          data?.historico?.map((item: any) => (
            <Card key={item.data} className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="font-semibold">{item.data}</p>
                <p className="text-sm text-slate-600">
                  Trabalhado: {formatMinutes(item.minutosTrabalhados)}
                </p>
                <p className="text-sm text-slate-600">
                  Carga prevista: {formatMinutes(item.cargaDiariaMin)}
                </p>
                <p className="text-sm text-slate-600">
                  Extras: {item.horasExtrasFormatadas || formatMinutes(item.horasExtrasMinutos)}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}