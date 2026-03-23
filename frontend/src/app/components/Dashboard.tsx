import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
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
import { DeliveryReports } from "./DeliveryReports";
import { PackageEntry } from "./PackageEntry";
import { DashboardOverview } from "./DashboardOverview";

type UserData = {
  matricula: string;
  nome: string;
  cargo: string;
};

type DashboardProps = {
  userData: UserData;
  onLogout: () => void;
};

export function Dashboard({ userData, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Package className="size-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Express Encomendas</h1>
                <p className="text-xs text-slate-600">Sistema de Gestão</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{userData.nome}</p>
                <p className="text-xs text-slate-600">{userData.cargo} - Mat. {userData.matricula}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid h-auto p-1">
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
            <DeliveryReports userData={userData} />
          </TabsContent>

          <TabsContent value="packages">
            <PackageEntry userData={userData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
