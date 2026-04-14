import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Clock,
  Package,
  FileText,
  LogOut,
  User,
  TrendingUp,
  PackageCheck,
  Home,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";
import { TimeClockApp } from "./TimeClockApp";
import DeliveryReports from "./DeliveryReports";
import { PackageEntry } from "./PackageEntry";
import { DashboardOverview } from "./DashboardOverview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

/**
 * Dados do usuário que são exibidos no dashboard
 */
type UserData = {
  id: number;
  usuarioId: number;
  matricula: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: string;
};

/**
 * Props do componente Dashboard
 */
type DashboardProps = {
  userData: UserData; // Dados do usuário logado
  onLogout: () => void; // Callback para logout
};

/**
 * Componente Dashboard (Principal)
 *
 * Responsabilidades:
 * - Exibir interface principal após login
 * - Gerenciar abas de navegação
 * - Exibir:
 *   1. Overview: Resumo do dia
 *   2. Ponto: Relógio eletrônico
 *   3. Entregas: Relatório de entregas
 *   4. Registros: Pacotes/registros
 * - Exibir informações do usuário
 * - Permitir logout
 *
 * Layout:
 * - Header: Logo, nome do usuário, botão logout
 * - Abas: Navegação entre seções
 * - Conteúdo: Seção ativa
 */
export function Dashboard({ userData, onLogout }: DashboardProps) {
  // Estado: Aba ativa (overview, ponto, entregas, registros)
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Package className="size-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  LogiControl
                </h1>
                <p className="text-xs text-slate-600">Sistema de Gestão</p>
              </div>
            </div>

            {/* Informações do Usuário e Logout */}
            <div className="flex items-center gap-4">
              {/* Nome, cargo e matrícula (oculto em mobile) */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {userData.nome}
                </p>
                <p className="text-xs text-slate-600">
                  {userData.cargo} - Mat. {userData.matricula}
                </p>
              </div>
              {/* Botão de logout */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deseja sair do sistema?</AlertDialogTitle>

                    <AlertDialogDescription>
                      Você será desconectado e precisará fazer login novamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={onLogout}
                    >
                      Confirmar saída
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Abas de navegação */}
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid h-auto p-1">
            {/* Aba: Overview */}
            <TabsTrigger value="overview" className="gap-2 py-2.5">
              <Home className="size-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Início</span>
            </TabsTrigger>
            <TabsTrigger value="timeclock" className="gap-2 py-2.5">
              <Clock className="size-4" />
              <span className="hidden sm:inline">Ponto Eletrônico</span>
              <span className="sm:hidden">Ponto</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 py-2.5">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden">Relatório</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="gap-2 py-2.5">
              <PackageCheck className="size-4" />
              <span className="hidden sm:inline">Entrada de Pacotes</span>
              <span className="sm:hidden">Pacotes</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview userData={userData} />
          </TabsContent>

          <TabsContent value="timeclock">
            <TimeClockApp userData={userData} onLogout={onLogout} hideHeader />
          </TabsContent>

          <TabsContent value="reports">
            <DeliveryReports />
          </TabsContent>

          <TabsContent value="packages">
            <PackageEntry userData={userData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
