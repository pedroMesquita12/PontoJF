import { ReactNode } from "react";
import {
  BarChart3,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
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
import { useState } from "react";

type UserData = {
  id?: number;
  usuarioId?: number;
  matricula?: string;
  nome?: string;
  email?: string;
  cargo?: string;
  perfil?: string;
  isAdmin?: boolean;
};

type MenuItem = {
  key: string;
  label: string;
  icon: React.ElementType;
};

type AppShellProps = {
  children: ReactNode;
  activeKey: string;
  onNavigate: (key: string) => void;
  userData?: UserData | null;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
  menuItems?: MenuItem[];
};

const defaultMenuItems: MenuItem[] = [
  { key: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { key: "timeclock", label: "Ponto Eletrônico", icon: Clock3 },
  { key: "reports", label: "Relatórios", icon: BarChart3 },
  { key: "packages", label: "Entrada de Pacotes", icon: Package },
  { key: "settings", label: "Configurações", icon: Settings },
];

function getInitials(name?: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function AppShell({
  children,
  activeKey,
  onNavigate,
  userData,
  onLogout,
  title = "LogiControl",
  subtitle = "Sistema de Gestão",
  menuItems = defaultMenuItems,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userName = userData?.nome || "Usuário";
  const userRole = userData?.cargo || userData?.perfil || "Colaborador";

  const sidebar = (
    <aside className="flex h-full w-[282px] flex-col overflow-hidden rounded-r-[32px] bg-[linear-gradient(180deg,#06084f_0%,#0b0f72_48%,#16118b_100%)] text-white shadow-2xl shadow-indigo-950/20">
      <div className="px-7 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-950/30 ring-1 ring-white/20">
            <Package className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold leading-none">{title}</h1>
            <p className="mt-1 text-xs font-medium text-white/70">{subtitle}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onNavigate(item.key);
                setMobileOpen(false);
              }}
              className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-sm font-semibold transition-all ${
                active
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                  : "text-white/82 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mx-6 mb-5 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
            {getInitials(userName)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{userName}</p>
            <p className="truncate text-xs text-white/65">{userRole}</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white">
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deseja sair do sistema?</AlertDialogTitle>
              <AlertDialogDescription>
                Você será desconectado e precisará informar suas credenciais novamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onLogout}>
                Confirmar saída
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#20275b]">
      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-y-0 left-0"
            >
              {sidebar}
            </motion.div>
          </div>
        )}

        <main className="min-w-0 flex-1 lg:pl-[282px]">
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:hidden">
            <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 font-bold">
              <Package className="h-5 w-5 text-violet-600" />
              LogiControl
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5 opacity-0" />
            </Button>
          </div>

          <div className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
