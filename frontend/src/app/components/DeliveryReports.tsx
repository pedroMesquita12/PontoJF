import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Download,
  Filter,
  Upload,
  FileSpreadsheet,
  Loader2,
  Trash2,
} from "lucide-react";

type EntregaStatus = "ENTREGUE" | "EM_ROTA" | "PENDENTE" | "CANCELADO" | null;

type Entrega = {
  id: string;
  codigo: string | null;
  endereco: string | null;
  cidade: string | null;
  dataEntrega: string | null;
  status: EntregaStatus;
  valorEntrega: string | number | null;
  entregadorNome?: string | null;
  entregadorTelefone?: string | null;
  origemArquivo?: string | null;
};

type DadosRelatorio = {
  stats: {
    totalEntregas: number;
    entregues: number;
    emRota: number;
    pendentes: number;
    canceladas?: number;
  };
  financeiro?: {
    valorTotal: number;
    ticketMedio: number;
    maiorEntrega: number;
    menorEntrega: number;
    totalComValor: number;
  };
  entregas: Entrega[];
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
  const isFormData = options.body instanceof FormData;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!isFormData && !headers.has("Content-Type")) {
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

  return { response, data };
}

export default function DeliveryReports() {
  const [dados, setDados] = useState<DadosRelatorio | null>(null);
  const [cidades, setCidades] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [arquivosSelecionados, setArquivosSelecionados] = useState<string[]>([]);
  const [entregasSelecionadas, setEntregasSelecionadas] = useState<string[]>([]);

  let usuario: any = null;

  try {
    const userData = localStorage.getItem("user");
    usuario = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Erro ao ler usuário do localStorage:", error);
  }

  const usuarioId = usuario?.id || usuario?.usuarioId || 1;

  const entregas = useMemo(() => dados?.entregas ?? [], [dados]);

  const arquivosUnicos = useMemo(() => {
    const set = new Set<string>();

    entregas.forEach((e) => {
      if (e.origemArquivo) {
        set.add(e.origemArquivo);
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [entregas]);

  async function carregarCidades() {
    try {
      const { data } = await apiFetch("/admin/relatorios/entregas/cidades");
      setCidades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function carregarEntregas() {
    try {
      setLoading(true);
      setErro("");

      const params = new URLSearchParams();

      if (cidade) params.append("cidade", cidade);
      if (status) params.append("status", status);
      if (dataInicio) params.append("dataInicio", dataInicio);
      if (dataFim) params.append("dataFim", dataFim);
      if (busca) params.append("busca", busca);

      const query = params.toString();
      const url = query
        ? `/admin/relatorios/entregas?${query}`
        : "/admin/relatorios/entregas";

      const { data } = await apiFetch(url);
      setDados(data);
    } catch (err: any) {
      console.error(err);
      setErro(err?.message || "Não foi possível carregar os relatórios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCidades();
  }, []);

  useEffect(() => {
    carregarEntregas();
  }, [cidade, status, dataInicio, dataFim, busca]);

  useEffect(() => {
    setArquivosSelecionados((prev) =>
      prev.filter((nome) => arquivosUnicos.includes(nome))
    );
  }, [arquivosUnicos]);

  useEffect(() => {
    setEntregasSelecionadas((prev) =>
      prev.filter((id) => entregas.some((entrega) => entrega.id === id))
    );
  }, [entregas]);

  async function importarArquivo() {
    if (!arquivo) {
      setErro("Selecione um arquivo .xlsx ou .csv antes de importar.");
      return;
    }

    try {
      setUploading(true);
      setErro("");
      setMensagem("");

      const formData = new FormData();
      formData.append("file", arquivo);

      const { data } = await apiFetch(
        `/admin/relatorios/importar/entregas?usuarioId=${usuarioId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      setMensagem(
        `Planilha importada com sucesso. ${data?.totalImportado ?? 0} registros adicionados.`
      );

      setArquivo(null);

      const input = document.getElementById(
        "input-planilha"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      await carregarCidades();
      await carregarEntregas();
    } catch (err: any) {
      console.error(err);
      setErro(err?.message || "Erro ao importar planilha.");
    } finally {
      setUploading(false);
    }
  }

  function limparFiltros() {
    setBusca("");
    setCidade("");
    setStatus("");
    setDataInicio("");
    setDataFim("");
  }

  function toggleArquivo(nome: string) {
    setArquivosSelecionados((prev) =>
      prev.includes(nome)
        ? prev.filter((item) => item !== nome)
        : [...prev, nome]
    );
  }

  function toggleEntrega(id: string) {
    setEntregasSelecionadas((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }

  function selecionarTodasPlanilhas() {
    setArquivosSelecionados(arquivosUnicos);
  }

  function limparSelecaoPlanilhas() {
    setArquivosSelecionados([]);
  }

  function selecionarTodasEntregas() {
    setEntregasSelecionadas(entregas.map((entrega) => entrega.id));
  }

  function limparSelecaoEntregas() {
    setEntregasSelecionadas([]);
  }

  async function handleApagar() {
    const totalEntregas = entregasSelecionadas.length;
    const totalArquivos = arquivosSelecionados.length;

    if (totalEntregas === 0 && totalArquivos === 0) {
      const confirmarTudo = window.confirm(
        "Nenhum item foi selecionado. Deseja apagar TODOS os dados importados?"
      );

      if (!confirmarTudo) return;

      try {
        setDeleting(true);
        setErro("");
        setMensagem("");

        const { data } = await apiFetch("/admin/relatorios/entregas", {
          method: "DELETE",
        });

        setMensagem(
          typeof data === "string"
            ? data
            : data?.message || "Todos os dados foram removidos com sucesso."
        );

        setArquivosSelecionados([]);
        setEntregasSelecionadas([]);

        await carregarCidades();
        await carregarEntregas();
      } catch (err: any) {
        console.error(err);
        setErro(err?.message || "Erro ao apagar tudo.");
      } finally {
        setDeleting(false);
      }

      return;
    }

    let texto = "Deseja apagar os itens selecionados?\n\n";

    if (totalEntregas > 0) {
      texto += `• ${totalEntregas} dado(s) específico(s)\n`;
    }

    if (totalArquivos > 0) {
      texto += `• ${totalArquivos} planilha(s) selecionada(s)\n`;
    }

    const confirmar = window.confirm(texto);
    if (!confirmar) return;

    try {
      setDeleting(true);
      setErro("");
      setMensagem("");

      if (totalEntregas > 0) {
        await apiFetch("/admin/relatorios/entregas/selecionadas", {
          method: "DELETE",
          body: JSON.stringify({
            ids: entregasSelecionadas,
          }),
        });
      }

      if (totalArquivos > 0) {
        await apiFetch("/admin/relatorios/entregas/arquivos", {
          method: "DELETE",
          body: JSON.stringify({
            arquivos: arquivosSelecionados,
          }),
        });
      }

      setMensagem("Itens selecionados removidos com sucesso.");
      setArquivosSelecionados([]);
      setEntregasSelecionadas([]);

      await carregarCidades();
      await carregarEntregas();
    } catch (err: any) {
      console.error(err);
      setErro(err?.message || "Erro ao apagar itens.");
    } finally {
      setDeleting(false);
    }
  }

  function formatarStatus(status: EntregaStatus) {
    switch (status) {
      case "ENTREGUE":
        return "Entregue";
      case "EM_ROTA":
        return "Em Rota";
      case "PENDENTE":
        return "Pendente";
      case "CANCELADO":
        return "Cancelado";
      default:
        return "Sem status";
    }
  }

  async function exportarEntregas() {
    try {
      setErro("");
      setMensagem("");

      const token = getToken();

      const body =
        entregasSelecionadas.length > 0
          ? { ids: entregasSelecionadas }
          : {
              cidade,
              status,
              dataInicio,
              dataFim,
              busca,
            };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/admin/relatorios/entregas/exportar`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const erroData = await response.json();
          throw new Error(erroData?.message || "Erro ao exportar relatório.");
        }

        const erroTexto = await response.text();
        throw new Error(erroTexto || "Erro ao exportar relatório.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        entregasSelecionadas.length > 0
          ? "entregas-selecionadas.xlsx"
          : "relatorio-entregas.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMensagem(
        entregasSelecionadas.length > 0
          ? "Registros selecionados exportados com sucesso."
          : "Relatório exportado com sucesso."
      );
    } catch (err: any) {
      console.error(err);
      setErro(err?.message || "Não foi possível exportar os dados.");
    }
  }

  function getStatusClasses(status: EntregaStatus) {
    switch (status) {
      case "ENTREGUE":
        return "bg-green-100 text-green-700 border-green-200";
      case "EM_ROTA":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CANCELADO":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  function formatarData(data?: string | null) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("pt-BR");
  }

  function formatarHorario(data?: string | null) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    const iso = typeof data === "string" ? data : "";

    const ehDataSemHoraReal =
      iso.includes("T00:00:00") ||
      iso.includes("T00:00:00.000Z") ||
      (date.getUTCHours() === 0 &&
        date.getUTCMinutes() === 0 &&
        date.getUTCSeconds() === 0);

    if (ehDataSemHoraReal) {
      return "-";
    }

    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarValor(valor?: string | number | null) {
    if (valor === null || valor === undefined || valor === "") return "-";

    const numero = typeof valor === "number" ? valor : Number(valor);

    if (Number.isNaN(numero)) return String(valor);

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <h1 className="text-4xl font-bold text-[#15182e]">
            Relatórios de Entregas
          </h1>
          <p className="mt-1 text-[#646680]">
            Importe planilhas da empresa e filtre as entregas por cidade, status,
            data e busca textual.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <label
            htmlFor="input-planilha"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#15182e] shadow-sm hover:bg-gray-50"
          >
            <FileSpreadsheet size={16} />
            {arquivo ? arquivo.name : "Selecionar planilha"}
          </label>

          <input
            id="input-planilha"
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files?.[0] || null)}
          />

          <button
            onClick={importarArquivo}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-[#15182e] px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? "Importando..." : "Importar planilha"}
          </button>

          <button
            onClick={exportarEntregas}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#15182e] shadow-sm hover:bg-gray-50"
          >
            <Download size={16} />
            {entregasSelecionadas.length > 0
              ? `Exportar selecionados (${entregasSelecionadas.length})`
              : "Exportar Relatório"}
          </button>

          <button
            onClick={handleApagar}
            disabled={deleting || uploading}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {deleting ? "Apagando..." : "Apagar"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[#15182e]">
            Planilhas importadas
          </h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={selecionarTodasPlanilhas}
              disabled={arquivosUnicos.length === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Selecionar todas
            </button>

            <button
              onClick={limparSelecaoPlanilhas}
              disabled={arquivosSelecionados.length === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Limpar seleção
            </button>
          </div>
        </div>

        {arquivosUnicos.length === 0 ? (
          <p className="text-sm text-[#646680]">
            Nenhuma planilha importada encontrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {arquivosUnicos.map((nomeArquivo) => (
              <label
                key={nomeArquivo}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={arquivosSelecionados.includes(nomeArquivo)}
                  onChange={() => toggleArquivo(nomeArquivo)}
                />
                <span className="text-sm text-[#15182e]">{nomeArquivo}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {mensagem && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Valor Total</p>
          <h3 className="mt-4 text-4xl font-bold text-[#15182e]">
            {formatarValor(dados?.financeiro?.valorTotal ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Faturamento total</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Ticket Médio</p>
          <h3 className="mt-4 text-4xl font-bold text-[#15182e]">
            {formatarValor(dados?.financeiro?.ticketMedio ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Média por entrega</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Maior Entrega</p>
          <h3 className="mt-4 text-4xl font-bold text-green-600">
            {formatarValor(dados?.financeiro?.maiorEntrega ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Maior valor</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Menor Entrega</p>
          <h3 className="mt-4 text-4xl font-bold text-blue-600">
            {formatarValor(dados?.financeiro?.menorEntrega ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Menor valor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Total de Entregas</p>
          <h3 className="mt-4 text-4xl font-bold text-[#15182e]">
            {dados?.stats.totalEntregas ?? 0}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Resultado filtrado</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Entregues</p>
          <h3 className="mt-4 text-4xl font-bold text-green-600">
            {dados?.stats.entregues ?? 0}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Concluídas</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Em Rota</p>
          <h3 className="mt-4 text-4xl font-bold text-blue-600">
            {dados?.stats.emRota ?? 0}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Em andamento</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#646680]">Pendentes</p>
          <h3 className="mt-4 text-4xl font-bold text-yellow-500">
            {dados?.stats.pendentes ?? 0}
          </h3>
          <p className="mt-2 text-sm text-[#8c8da9]">Aguardando</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3">
              <Search size={18} className="text-[#8c8da9]" />
              <input
                type="text"
                placeholder="Buscar por código, endereço, cidade ou entregador..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none"
          >
            <option value="">Todas as cidades</option>
            {cidades.map((cidadeItem) => (
              <option key={cidadeItem} value={cidadeItem}>
                {cidadeItem}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none"
          >
            <option value="">Todos os status</option>
            <option value="ENTREGUE">Entregue</option>
            <option value="EM_ROTA">Em Rota</option>
            <option value="PENDENTE">Pendente</option>
            <option value="CANCELADO">Cancelado</option>
          </select>

          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none"
          />

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={limparFiltros}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[#15182e] hover:bg-gray-50"
          >
            <Filter size={15} />
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#15182e]">
              Entregas Recentes
            </h2>
            <p className="text-[#646680]">
              Lista de entregas encontradas ({entregas.length} resultados)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={selecionarTodasEntregas}
              disabled={entregas.length === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Selecionar todas
            </button>

            <button
              onClick={limparSelecaoEntregas}
              disabled={entregasSelecionadas.length === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Limpar seleção
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[#646680]">
            <Loader2 size={18} className="animate-spin" />
            Carregando...
          </div>
        ) : entregas.length === 0 ? (
          <div className="py-10 text-center text-[#646680]">
            Nenhuma entrega encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="space-y-3">
            {entregas.map((entrega) => (
              <div
                key={entrega.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 p-4 lg:flex-row lg:items-center"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={entregasSelecionadas.includes(entrega.id)}
                    onChange={() => toggleEntrega(entrega.id)}
                    className="mt-1"
                  />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <strong className="text-lg text-[#15182e]">
                        {entrega.codigo || "Sem código"}
                      </strong>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          entrega.status
                        )}`}
                      >
                        {formatarStatus(entrega.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#646680]">
                      <MapPin size={15} />
                      <span>
                        {[entrega.endereco, entrega.cidade]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    </div>

                    <div className="text-sm text-[#646680]">
                      Entregador: {entrega.entregadorNome || "-"}
                      {entrega.entregadorTelefone
                        ? ` • ${entrega.entregadorTelefone}`
                        : ""}
                    </div>

                    {entrega.origemArquivo && (
                      <div className="text-xs text-[#8c8da9]">
                        Arquivo: {entrega.origemArquivo}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid min-w-[220px] grid-cols-2 gap-4 text-sm lg:text-right">
                  <div>
                    <p className="text-[#8c8da9]">Data</p>
                    <p className="font-semibold text-[#15182e]">
                      {formatarData(entrega.dataEntrega)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8c8da9]">Horário</p>
                    <p className="font-semibold text-[#15182e]">
                      {formatarHorario(entrega.dataEntrega)}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[#8c8da9]">Valor</p>
                    <p className="font-semibold text-[#15182e]">
                      {formatarValor(entrega.valorEntrega)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}