import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  User,
  Calendar,
  Search,
  Download,
  CheckCircle2,
  Coffee,
  LogIn,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";

type TimeEntry = {
  id: string;
  type: "entrada" | "saida" | "pausa_inicio" | "pausa_fim";
  timestamp: string;
};

type Employee = {
  id: string;
  matricula: string;
  nome: string;
  cargo: string;
  status: "trabalhando" | "pausa" | "fora";
  horasTrabalhadas: string;
  horasSemanais: string;
  horasPausa: string;
  entradas: TimeEntry[];
  ultimaEntrada?: string;
  ultimaSaida?: string;
};

const API_URL = "/api";

export function EmployeeTimeRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token não encontrado. Faça login novamente.");
        }

        const url = `${API_URL}/admin/ponto/funcionarios?date=${selectedDate}`;
        console.log("Buscando registros em:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Status da resposta:", response.status);

        if (!response.ok) {
          let mensagem = `Erro ao carregar registros (${response.status})`;

          try {
            const erro = await response.json();
            console.log("Resposta de erro:", erro);

            if (erro?.message) {
              mensagem = Array.isArray(erro.message)
                ? erro.message.join(", ")
                : erro.message;
            }
          } catch {
            // ignora erro ao tentar ler resposta como JSON
          }

          throw new Error(mensagem);
        }

        const data = await response.json();
        console.log("Funcionários recebidos:", data);

        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          console.warn("Resposta inesperada da API:", data);
          setEmployees([]);
          setErrorMessage("A API retornou um formato inesperado.");
        }
      } catch (error) {
        console.error("Erro ao carregar registros de ponto:", error);
        setEmployees([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os registros."
        );
      } finally {
        setIsLoading(false);
      }
    };

    carregar();
  }, [selectedDate]);

  const filteredEmployees = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      return (
        employee.nome.toLowerCase().includes(termo) ||
        employee.matricula.includes(searchTerm) ||
        employee.cargo.toLowerCase().includes(termo)
      );
    });
  }, [employees, searchTerm]);

  const sortedEmployees = useMemo(() => {
    const prioridade: Record<Employee["status"], number> = {
      trabalhando: 1,
      pausa: 2,
      fora: 3,
    };

    return [...filteredEmployees].sort((a, b) => {
      const diferencaPrioridade = prioridade[a.status] - prioridade[b.status];

      if (diferencaPrioridade !== 0) {
        return diferencaPrioridade;
      }

      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [filteredEmployees]);

  const stats = {
    totalFuncionarios: sortedEmployees.length,
    trabalhando: sortedEmployees.filter((e) => e.status === "trabalhando").length,
    emPausa: sortedEmployees.filter((e) => e.status === "pausa").length,
    fora: sortedEmployees.filter((e) => e.status === "fora").length,
  };

  const getStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "trabalhando":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="size-3 mr-1" />
            Trabalhando
          </Badge>
        );
      case "pausa":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Coffee className="size-3 mr-1" />
            Em Pausa
          </Badge>
        );
      case "fora":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            <LogOut className="size-3 mr-1" />
            Fora
          </Badge>
        );
    }
  };

  const getEntryIcon = (type: TimeEntry["type"]) => {
    switch (type) {
      case "entrada":
        return <LogIn className="size-4 text-green-600" />;
      case "saida":
        return <LogOut className="size-4 text-red-600" />;
      case "pausa_inicio":
        return <Coffee className="size-4 text-yellow-600" />;
      case "pausa_fim":
        return <CheckCircle2 className="size-4 text-blue-600" />;
    }
  };

  const getEntryLabel = (type: TimeEntry["type"]) => {
    switch (type) {
      case "entrada":
        return "Entrada";
      case "saida":
        return "Saída";
      case "pausa_inicio":
        return "Início da Pausa";
      case "pausa_fim":
        return "Fim da Pausa";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Registros de Ponto</h2>
            <p className="text-slate-600 mt-1">
              Histórico e acompanhamento de todos os funcionários
            </p>
          </div>

          <Button className="gap-2">
            <Download className="size-4" />
            Exportar Relatório
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalFuncionarios}
            </div>
            <p className="text-xs text-slate-600 mt-1">Funcionários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Trabalhando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.trabalhando}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Em Pausa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.emPausa}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Fora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{stats.fora}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nome, matrícula ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <Label htmlFor="date" className="sr-only">
                Data
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-slate-600">
            Carregando registros...
          </CardContent>
        </Card>
      ) : errorMessage ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="size-12 text-red-300 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Erro ao carregar registros</p>
              <p className="text-slate-600 mt-2">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : sortedEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum funcionário encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedEmployees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <User className="size-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{employee.nome}</CardTitle>
                        {getStatusBadge(employee.status)}
                      </div>
                      <CardDescription>
                        {employee.cargo} - Matrícula: {employee.matricula}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 text-xs">Horas do Dia</p>
                      <p className="font-semibold text-slate-900">
                        {employee.horasTrabalhadas}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Horas da Semana</p>
                      <p className="font-semibold text-slate-900">
                        {employee.horasSemanais}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Tempo de Pausa</p>
                      <p className="font-semibold text-slate-900">
                        {employee.horasPausa}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Última Entrada/Saída</p>
                      <p className="font-semibold text-slate-900">
                        {employee.ultimaEntrada ?? "-"} / {employee.ultimaSaida ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Histórico do Dia ({employee.entradas.length})
                  </p>

                  {employee.entradas.length === 0 ? (
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600">
                      Nenhum registro de ponto neste dia.
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {employee.entradas.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
                        >
                          {getEntryIcon(entry.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700">
                              {getEntryLabel(entry.type)}
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {entry.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}