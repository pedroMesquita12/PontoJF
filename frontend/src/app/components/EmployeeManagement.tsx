import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserRoundX,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

type Employee = {
  id: number;
  usuarioId: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  matricula: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  dataAdmissao: string;
  status: "ATIVO" | "INATIVO";
  cargoId: number | null;
  cargo: string;
  setorId: number | null;
  setor: string;
  empresaId: number | null;
  empresa: string;
  unidadeId: number | null;
  unidade: string;
  supervisorId: number | null;
  supervisor: string;
  turnoNome: string;
  cargaHorariaDiaria: number | null;
  toleranciaMinutos: number;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
};

type OptionItem = { id: number; nome: string; empresaId?: number };

type OptionsResponse = {
  cargos: OptionItem[];
  setores: OptionItem[];
  empresas: OptionItem[];
  unidades: OptionItem[];
  supervisores: { id: number; nome: string; matricula: string }[];
  perfis: string[];
  status: string[];
};

type EmployeeForm = {
  nome: string;
  email: string;
  senha: string;
  matricula: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  data_admissao: string;
  cargo_id: string;
  setor_id: string;
  empresa_id: string;
  unidade_id: string;
  supervisor_id: string;
  turno_nome: string;
  carga_horaria_diaria: string;
  tolerancia_minutos: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
  perfil: string;
  status: string;
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

const emptyForm: EmployeeForm = {
  nome: "",
  email: "",
  senha: "",
  matricula: "",
  cpf: "",
  telefone: "",
  data_nascimento: "",
  data_admissao: new Date().toISOString().split("T")[0],
  cargo_id: "",
  setor_id: "",
  empresa_id: "",
  unidade_id: "",
  supervisor_id: "",
  turno_nome: "",
  carga_horaria_diaria: "8",
  tolerancia_minutos: "10",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  observacoes: "",
  perfil: "FUNCIONARIO",
  status: "ATIVO",
};

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

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${url}`, {
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

function mapEmployeeToForm(employee: Employee): EmployeeForm {
  return {
    nome: employee.nome || "",
    email: employee.email || "",
    senha: "",
    matricula: employee.matricula || "",
    cpf: employee.cpf || "",
    telefone: employee.telefone || "",
    data_nascimento: employee.dataNascimento || "",
    data_admissao: employee.dataAdmissao || "",
    cargo_id: employee.cargoId ? String(employee.cargoId) : "",
    setor_id: employee.setorId ? String(employee.setorId) : "",
    empresa_id: employee.empresaId ? String(employee.empresaId) : "",
    unidade_id: employee.unidadeId ? String(employee.unidadeId) : "",
    supervisor_id: employee.supervisorId ? String(employee.supervisorId) : "",
    turno_nome: employee.turnoNome || "",
    carga_horaria_diaria:
      employee.cargaHorariaDiaria !== null ? String(employee.cargaHorariaDiaria) : "8",
    tolerancia_minutos: String(employee.toleranciaMinutos ?? 10),
    endereco: employee.endereco || "",
    cidade: employee.cidade || "",
    estado: employee.estado || "",
    cep: employee.cep || "",
    observacoes: employee.observacoes || "",
    perfil: employee.perfil || "FUNCIONARIO",
    status: employee.status || "ATIVO",
  };
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [employeesData, optionsData] = await Promise.all([
        apiFetch(`/admin/funcionarios${search ? `?search=${encodeURIComponent(search)}` : ""}`),
        apiFetch("/admin/funcionarios/options"),
      ]);

      setEmployees(employeesData as Employee[]);
      setOptions(optionsData as OptionsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar funcionários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredUnits = useMemo(() => {
    const empresaId = Number(form.empresa_id || 0);
    if (!options) return [];
    if (!empresaId) return options.unidades;
    return options.unidades.filter((unit) => unit.empresaId === empresaId);
  }, [form.empresa_id, options]);

  const openCreateDialog = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setForm(mapEmployeeToForm(employee));
    setDialogOpen(true);
  };

  const updateForm = (field: keyof EmployeeForm, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "empresa_id") {
        next.unidade_id = "";
      }
      return next;
    });
  };

  const buildPayload = () => ({
    nome: form.nome,
    email: form.email,
    ...(form.senha ? { senha: form.senha } : {}),
    matricula: form.matricula,
    cpf: form.cpf,
    telefone: form.telefone || undefined,
    data_nascimento: form.data_nascimento || undefined,
    data_admissao: form.data_admissao,
    cargo_id: form.cargo_id ? Number(form.cargo_id) : undefined,
    setor_id: form.setor_id ? Number(form.setor_id) : undefined,
    empresa_id: form.empresa_id ? Number(form.empresa_id) : undefined,
    unidade_id: form.unidade_id ? Number(form.unidade_id) : undefined,
    supervisor_id: form.supervisor_id ? Number(form.supervisor_id) : undefined,
    turno_nome: form.turno_nome || undefined,
    carga_horaria_diaria: form.carga_horaria_diaria
      ? Number(form.carga_horaria_diaria)
      : undefined,
    tolerancia_minutos: form.tolerancia_minutos
      ? Number(form.tolerancia_minutos)
      : undefined,
    endereco: form.endereco || undefined,
    cidade: form.cidade || undefined,
    estado: form.estado || undefined,
    cep: form.cep || undefined,
    observacoes: form.observacoes || undefined,
    perfil: form.perfil,
    status: form.status,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = buildPayload();

      if (editingEmployee) {
        await apiFetch(`/admin/funcionarios/${editingEmployee.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/admin/funcionarios", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingEmployee(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar funcionário.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      setError("");
      await apiFetch(`/admin/funcionarios/${employee.id}/status`, {
        method: "PATCH",
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao alterar status.");
    }
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Deseja remover o funcionário ${employee.nome}? Esta ação exclui o usuário vinculado.`,
    );

    if (!confirmed) return;

    try {
      setError("");
      await apiFetch(`/admin/funcionarios/${employee.id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao remover funcionário.");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Funcionários</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cadastre, edite, ative e inative funcionários do sistema.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCcw className="size-4" />
            Atualizar
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={openCreateDialog}>
                <Plus className="size-4" />
                Novo funcionário
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Editar funcionário" : "Cadastrar funcionário"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={form.nome}
                      onChange={(e) => updateForm("nome", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Senha {editingEmployee ? "(opcional)" : ""}</Label>
                    <Input
                      type="password"
                      value={form.senha}
                      onChange={(e) => updateForm("senha", e.target.value)}
                      required={!editingEmployee}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Matrícula</Label>
                    <Input
                      value={form.matricula}
                      onChange={(e) => updateForm("matricula", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={form.cpf}
                      onChange={(e) => updateForm("cpf", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={form.telefone}
                      onChange={(e) => updateForm("telefone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de nascimento</Label>
                    <Input
                      type="date"
                      value={form.data_nascimento}
                      onChange={(e) => updateForm("data_nascimento", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de admissão</Label>
                    <Input
                      type="date"
                      value={form.data_admissao}
                      onChange={(e) => updateForm("data_admissao", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={form.cargo_id}
                      onChange={(e) => updateForm("cargo_id", e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {options?.cargos.map((cargo) => (
                        <option key={cargo.id} value={cargo.id}>
                          {cargo.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={form.setor_id}
                      onChange={(e) => updateForm("setor_id", e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {options?.setores.map((setor) => (
                        <option key={setor.id} value={setor.id}>
                          {setor.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={form.empresa_id}
                      onChange={(e) => updateForm("empresa_id", e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {options?.empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={form.unidade_id}
                      onChange={(e) => updateForm("unidade_id", e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {filteredUnits.map((unidade) => (
                        <option key={unidade.id} value={unidade.id}>
                          {unidade.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Supervisor</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={form.supervisor_id}
                      onChange={(e) => updateForm("supervisor_id", e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {options?.supervisores.map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.nome} - {supervisor.matricula}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Turno</Label>
                    <Input
                      value={form.turno_nome}
                      onChange={(e) => updateForm("turno_nome", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Carga horária diária</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="24"
                      value={form.carga_horaria_diaria}
                      onChange={(e) =>
                        updateForm("carga_horaria_diaria", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tolerância (min)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      value={form.tolerancia_minutos}
                      onChange={(e) =>
                        updateForm("tolerancia_minutos", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Perfil</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={form.perfil}
                      onChange={(e) => updateForm("perfil", e.target.value)}
                    >
                      {options?.perfis.map((perfil) => (
                        <option key={perfil} value={perfil}>
                          {perfil}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={form.status}
                      onChange={(e) => updateForm("status", e.target.value)}
                    >
                      {options?.status.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Endereço</Label>
                    <Input
                      value={form.endereco}
                      onChange={(e) => updateForm("endereco", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={form.cidade}
                      onChange={(e) => updateForm("cidade", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input
                      value={form.estado}
                      maxLength={2}
                      onChange={(e) =>
                        updateForm("estado", e.target.value.toUpperCase())
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={form.cep}
                      onChange={(e) => updateForm("cep", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={form.observacoes}
                      onChange={(e) => updateForm("observacoes", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Salvando..."
                      : editingEmployee
                        ? "Salvar alterações"
                        : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

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
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Buscar por nome, e-mail, matrícula ou CPF"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button variant="outline" onClick={loadData}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Carregando funcionários...
            </div>
          </CardContent>
        </Card>
      ) : employees.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center text-slate-500">
            Nenhum funcionário encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id} className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex h-full flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {employee.nome}
                      </h3>
                      <Badge
                        className={
                          employee.status === "ATIVO"
                            ? "bg-slate-900 text-white hover:bg-slate-900"
                            : ""
                        }
                        variant={
                          employee.status === "ATIVO" ? "default" : "secondary"
                        }
                      >
                        {employee.status}
                      </Badge>
                      <Badge variant="outline">{employee.perfil}</Badge>
                    </div>

                    <p className="text-sm text-slate-600">{employee.email}</p>
                    <p className="text-sm text-slate-600">
                      Matrícula {employee.matricula}
                    </p>
                    <p className="text-sm text-slate-600">
                      {employee.cargo || "Sem cargo"} • {employee.setor || "Sem setor"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {employee.empresa || "Sem empresa"} •{" "}
                      {employee.unidade || "Sem unidade"}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(employee)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Editar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(employee)}
                    >
                      <UserRoundX className="mr-2 size-4" />
                      {employee.status === "ATIVO" ? "Inativar" : "Ativar"}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(employee)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}