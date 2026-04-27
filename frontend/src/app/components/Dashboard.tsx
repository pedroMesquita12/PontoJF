import { useState } from "react";
import {
  BarChart3,
  Clock3,
  Home,
  PackageCheck,
} from "lucide-react";
import { AppShell } from "./AppShell";
import { TimeClockApp } from "./TimeClockApp";
import DeliveryReports from "./DeliveryReports";
import { PackageEntry } from "./PackageEntry";
import { DashboardOverview } from "./DashboardOverview";

type UserData = {
  id: number;
  usuarioId: number;
  matricula: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: string;
};

type DashboardProps = {
  userData: UserData;
  onLogout: () => void;
};

const employeeMenu = [
  { key: "overview", label: "Visão Geral", icon: Home },
  { key: "timeclock", label: "Ponto Eletrônico", icon: Clock3 },
  { key: "reports", label: "Relatórios", icon: BarChart3 },
  { key: "packages", label: "Entrada de Pacotes", icon: PackageCheck },
];

export function Dashboard({ userData, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  function renderContent() {
    switch (activeTab) {
      case "timeclock":
        return <TimeClockApp userData={userData} onLogout={onLogout} hideHeader />;
      case "reports":
        return <DeliveryReports />;
      case "packages":
        return <PackageEntry userData={userData} />;
      case "overview":
      default:
        return <DashboardOverview userData={userData} />;
    }
  }

  return (
    <AppShell
      activeKey={activeTab}
      onNavigate={setActiveTab}
      userData={userData}
      onLogout={onLogout}
      menuItems={employeeMenu}
    >
      {renderContent()}
    </AppShell>
  );
}
