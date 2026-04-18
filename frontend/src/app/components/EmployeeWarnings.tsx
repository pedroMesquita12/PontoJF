import { useEffect, useState } from "react";
import { AlertCircle, TriangleAlert } from "lucide-react";
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
      typeof data === "string" ? data : data?.message || "Erro ao carregar advertências",
    );
  }

  return data;
}

export function EmployeeWarnings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/ponto/me/advertencias");
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar advertências.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="grid gap-4">
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
          <CardContent className="py-12 text-center text-slate-500">
            Carregando advertências...
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center text-slate-500">
            Nenhuma advertência encontrada.
          </CardContent>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <TriangleAlert className="size-4 text-red-500" />
                <h3 className="font-semibold">{item.tipo}</h3>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                  {item.dataAdvertencia}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-700">{item.motivo}</p>
              <p className="mt-1 text-sm text-slate-500">
                {item.descricao || "Sem descrição adicional"}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}