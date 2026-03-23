import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Package,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Filter,
} from "lucide-react";
import { motion } from "motion/react";

type UserData = {
  matricula: string;
  nome: string;
  cargo: string;
};

type DeliveryReportsProps = {
  userData: UserData;
};

type Delivery = {
  id: string;
  codigo: string;
  destinatario: string;
  endereco: string;
  status: "entregue" | "pendente" | "em_rota";
  horario: string;
  data: string;
};

export function DeliveryReports({ userData }: DeliveryReportsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  // Mock data
  const deliveries: Delivery[] = [
    {
      id: "1",
      codigo: "#ENT-1234",
      destinatario: "Maria Silva",
      endereco: "Rua das Flores, 123 - Centro",
      status: "entregue",
      horario: "14:32",
      data: "2024-03-23",
    },
    {
      id: "2",
      codigo: "#ENT-1235",
      destinatario: "João Santos",
      endereco: "Av. Principal, 456 - Jardim",
      status: "entregue",
      horario: "13:15",
      data: "2024-03-23",
    },
    {
      id: "3",
      codigo: "#ENT-1236",
      destinatario: "Ana Costa",
      endereco: "Rua do Comércio, 789 - Vila Nova",
      status: "entregue",
      horario: "11:45",
      data: "2024-03-23",
    },
    {
      id: "4",
      codigo: "#ENT-1237",
      destinatario: "Pedro Oliveira",
      endereco: "Travessa das Palmeiras, 321 - Bairro Alto",
      status: "em_rota",
      horario: "15:00",
      data: "2024-03-23",
    },
    {
      id: "5",
      codigo: "#ENT-1238",
      destinatario: "Carla Mendes",
      endereco: "Rua da Esperança, 555 - Centro",
      status: "pendente",
      horario: "-",
      data: "2024-03-23",
    },
  ];

  const stats = {
    total: deliveries.length,
    entregues: deliveries.filter((d) => d.status === "entregue").length,
    pendentes: deliveries.filter((d) => d.status === "pendente").length,
    emRota: deliveries.filter((d) => d.status === "em_rota").length,
  };

  const getStatusBadge = (status: Delivery["status"]) => {
    switch (status) {
      case "entregue":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="size-3 mr-1" />
            Entregue
          </Badge>
        );
      case "em_rota":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Clock className="size-3 mr-1" />
            Em Rota
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Package className="size-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.endereco.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "todos" || delivery.status === filterStatus;

    return matchesSearch && matchesFilter;
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
            <h2 className="text-2xl font-bold text-slate-900">Relatórios de Entregas</h2>
            <p className="text-slate-600 mt-1">Acompanhe suas entregas realizadas</p>
          </div>
          <Button className="gap-2">
            <Download className="size-4" />
            Exportar Relatório
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total de Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-xs text-slate-600 mt-1">Hoje</p>
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
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Em Rota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.emRota}</div>
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
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
              <p className="text-xs text-slate-600 mt-1">Aguardando</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
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
                    placeholder="Buscar por código, destinatário ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "todos" ? "default" : "outline"}
                  onClick={() => setFilterStatus("todos")}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === "entregue" ? "default" : "outline"}
                  onClick={() => setFilterStatus("entregue")}
                  size="sm"
                >
                  Entregues
                </Button>
                <Button
                  variant={filterStatus === "em_rota" ? "default" : "outline"}
                  onClick={() => setFilterStatus("em_rota")}
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Em Rota
                </Button>
                <Button
                  variant={filterStatus === "pendente" ? "default" : "outline"}
                  onClick={() => setFilterStatus("pendente")}
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Pendentes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deliveries List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Entregas Recentes</CardTitle>
            <CardDescription>
              Lista de todas as entregas do dia ({filteredDeliveries.length}{" "}
              {filteredDeliveries.length === 1 ? "resultado" : "resultados"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDeliveries.map((delivery, index) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-slate-900">
                        {delivery.codigo}
                      </span>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <p className="font-medium text-slate-900">{delivery.destinatario}</p>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="size-4 mt-0.5 flex-shrink-0" />
                      <span>{delivery.endereco}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-slate-600">Horário</p>
                      <p className="font-medium text-slate-900">{delivery.horario}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredDeliveries.length === 0 && (
                <div className="text-center py-12">
                  <Package className="size-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhuma entrega encontrada</p>
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
