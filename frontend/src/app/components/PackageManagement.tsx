import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Package,
  Search,
  Download,
  Filter,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  PackageCheck,
  PackageX,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

type PackageStatus = "recebido" | "em_rota" | "entregue" | "atrasado";

type PackageItem = {
  id: string;
  codigo: string;
  destinatario: string;
  endereco: string;
  status: PackageStatus;
  responsavel: string;
  dataRecebimento: string;
  dataEntrega?: string;
  prioridade: "normal" | "urgente" | "expressa";
};

export function PackageManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterPriority, setFilterPriority] = useState<string>("todas");

  // Mock data
  const packages: PackageItem[] = [
    {
      id: "1",
      codigo: "PKG-1234",
      destinatario: "Maria Silva",
      endereco: "Rua das Flores, 123 - Centro",
      status: "entregue",
      responsavel: "João Silva",
      dataRecebimento: "2024-03-23 08:30",
      dataEntrega: "2024-03-23 14:32",
      prioridade: "normal",
    },
    {
      id: "2",
      codigo: "PKG-1235",
      destinatario: "Carlos Santos",
      endereco: "Av. Principal, 456 - Jardim",
      status: "em_rota",
      responsavel: "Maria Santos",
      dataRecebimento: "2024-03-23 09:15",
      prioridade: "urgente",
    },
    {
      id: "3",
      codigo: "PKG-1236",
      destinatario: "Ana Costa",
      endereco: "Rua do Comércio, 789 - Vila Nova",
      status: "entregue",
      responsavel: "Ana Costa",
      dataRecebimento: "2024-03-23 07:45",
      dataEntrega: "2024-03-23 11:45",
      prioridade: "expressa",
    },
    {
      id: "4",
      codigo: "PKG-1237",
      destinatario: "Pedro Oliveira",
      endereco: "Travessa das Palmeiras, 321 - Bairro Alto",
      status: "recebido",
      responsavel: "Pedro Oliveira",
      dataRecebimento: "2024-03-23 10:00",
      prioridade: "normal",
    },
    {
      id: "5",
      codigo: "PKG-1238",
      destinatario: "Juliana Mendes",
      endereco: "Rua da Esperança, 555 - Centro",
      status: "atrasado",
      responsavel: "João Silva",
      dataRecebimento: "2024-03-22 15:30",
      prioridade: "urgente",
    },
    {
      id: "6",
      codigo: "PKG-1239",
      destinatario: "Roberto Lima",
      endereco: "Av. Brasil, 888 - Zona Sul",
      status: "em_rota",
      responsavel: "Roberto Lima",
      dataRecebimento: "2024-03-23 11:20",
      prioridade: "normal",
    },
    {
      id: "7",
      codigo: "PKG-1240",
      destinatario: "Fernanda Costa",
      endereco: "Rua São João, 999 - Centro",
      status: "entregue",
      responsavel: "Maria Santos",
      dataRecebimento: "2024-03-23 08:00",
      dataEntrega: "2024-03-23 13:15",
      prioridade: "expressa",
    },
    {
      id: "8",
      codigo: "PKG-1241",
      destinatario: "Lucas Almeida",
      endereco: "Av. Paulista, 1500 - Bela Vista",
      status: "recebido",
      responsavel: "Ana Costa",
      dataRecebimento: "2024-03-23 12:45",
      prioridade: "normal",
    },
  ];

  const stats = {
    total: packages.length,
    recebidos: packages.filter((p) => p.status === "recebido").length,
    emRota: packages.filter((p) => p.status === "em_rota").length,
    entregues: packages.filter((p) => p.status === "entregue").length,
    atrasados: packages.filter((p) => p.status === "atrasado").length,
  };

  const getStatusBadge = (status: PackageStatus) => {
    switch (status) {
      case "recebido":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Package className="size-3 mr-1" />
            Recebido
          </Badge>
        );
      case "em_rota":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            <Truck className="size-3 mr-1" />
            Em Rota
          </Badge>
        );
      case "entregue":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="size-3 mr-1" />
            Entregue
          </Badge>
        );
      case "atrasado":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="size-3 mr-1" />
            Atrasado
          </Badge>
        );
    }
  };

  const getPriorityBadge = (prioridade: PackageItem["prioridade"]) => {
    switch (prioridade) {
      case "normal":
        return (
          <Badge variant="outline" className="text-xs">
            Normal
          </Badge>
        );
      case "urgente":
        return (
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
            Urgente
          </Badge>
        );
      case "expressa":
        return (
          <Badge variant="outline" className="text-xs border-red-300 text-red-700 bg-red-50">
            Expressa
          </Badge>
        );
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.responsavel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "todos" || pkg.status === filterStatus;

    const matchesPriority =
      filterPriority === "todas" || pkg.prioridade === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestão de Pacotes</h2>
            <p className="text-slate-600 mt-1">
              Visão completa de todos os pacotes no sistema
            </p>
          </div>
          <Button className="gap-2">
            <Download className="size-4" />
            Exportar Relatório
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-xs text-slate-600 mt-1">Todos os pacotes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Recebidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.recebidos}</div>
              <p className="text-xs text-slate-600 mt-1">Aguardando envio</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Em Rota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.emRota}</div>
              <p className="text-xs text-slate-600 mt-1">Em andamento</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Entregues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.entregues}</div>
              <p className="text-xs text-slate-600 mt-1">
                {Math.round((stats.entregues / stats.total) * 100)}% do total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Atrasados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.atrasados}</div>
              <p className="text-xs text-red-600 mt-1">Requer atenção</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por código, destinatário, endereço ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "todos" ? "default" : "outline"}
                    onClick={() => setFilterStatus("todos")}
                    size="sm"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filterStatus === "recebido" ? "default" : "outline"}
                    onClick={() => setFilterStatus("recebido")}
                    size="sm"
                  >
                    Recebidos
                  </Button>
                  <Button
                    variant={filterStatus === "em_rota" ? "default" : "outline"}
                    onClick={() => setFilterStatus("em_rota")}
                    size="sm"
                  >
                    Em Rota
                  </Button>
                  <Button
                    variant={filterStatus === "entregue" ? "default" : "outline"}
                    onClick={() => setFilterStatus("entregue")}
                    size="sm"
                  >
                    Entregues
                  </Button>
                  <Button
                    variant={filterStatus === "atrasado" ? "default" : "outline"}
                    onClick={() => setFilterStatus("atrasado")}
                    size="sm"
                  >
                    Atrasados
                  </Button>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex gap-2">
                  <Button
                    variant={filterPriority === "todas" ? "default" : "outline"}
                    onClick={() => setFilterPriority("todas")}
                    size="sm"
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filterPriority === "normal" ? "default" : "outline"}
                    onClick={() => setFilterPriority("normal")}
                    size="sm"
                  >
                    Normal
                  </Button>
                  <Button
                    variant={filterPriority === "urgente" ? "default" : "outline"}
                    onClick={() => setFilterPriority("urgente")}
                    size="sm"
                  >
                    Urgente
                  </Button>
                  <Button
                    variant={filterPriority === "expressa" ? "default" : "outline"}
                    onClick={() => setFilterPriority("expressa")}
                    size="sm"
                  >
                    Expressa
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Packages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Todos os Pacotes</CardTitle>
            <CardDescription>
              Exibindo {filteredPackages.length}{" "}
              {filteredPackages.length === 1 ? "pacote" : "pacotes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.03 }}
                  className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-slate-900">
                          {pkg.codigo}
                        </span>
                        {getStatusBadge(pkg.status)}
                        {getPriorityBadge(pkg.prioridade)}
                      </div>
                      <p className="font-medium text-slate-900">{pkg.destinatario}</p>
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="size-4 mt-0.5 flex-shrink-0" />
                        <span>{pkg.endereco}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-600">Responsável</p>
                        <p className="font-medium text-slate-900 flex items-center gap-1">
                          <User className="size-3" />
                          {pkg.responsavel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Recebido em</p>
                        <p className="font-medium text-slate-900 flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(pkg.dataRecebimento).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {pkg.dataEntrega && (
                        <div>
                          <p className="text-xs text-slate-600">Entregue em</p>
                          <p className="font-medium text-green-700 flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            {new Date(pkg.dataEntrega).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredPackages.length === 0 && (
                <div className="text-center py-12">
                  <Package className="size-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhum pacote encontrado</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Tente ajustar os filtros ou busca
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
