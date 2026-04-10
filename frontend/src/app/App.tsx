import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";
import { AdminDashboard } from "./components/AdminDashboard";

/**
 * Tipo que representa os dados do usuário autenticado
 * Contém todas as informações necessárias para renderizar dashboards e controlar acesso
 */
type UserData = {
  id: number;              // ID do funcionário
  usuarioId: number;       // ID do usuário
  matricula: string;       // Matrícula do funcionário
  nome: string;            // Nome completo
  email: string;           // Email do usuário
  cargo: string;           // Cargo/função do funcionário
  perfil: string;          // Perfil (tipo de usuário)
  isAdmin: boolean;        // Flag indicando se é administrador
};

/**
 * Componente raiz da aplicação (App)
 * 
 * Responsabilidades:
 * - Gerenciar estado de autenticação global
 * - Restaurar sessão do localStorage ao carregar
 * - Renderizar tela de login ou dashboard conforme estado
 * - Direcionar para AdminDashboard ou Dashboard baseado no perfil
 */
export default function App() {
  // Estado que controla se o usuário está logado
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Estado que armazena dados do usuário autenticado
  const [userData, setUserData] = useState<UserData | null>(null);

  /**
   * Hook para restaurar sessão ao carregar a aplicação
   * Executa uma única vez quando o componente é montado
   */
  useEffect(() => {
    // Tenta recuperar dados do usuário armazenados no localStorage
    const savedUser = localStorage.getItem("user");

    // Se encontrou dados salvos, restaura a sessão
    if (savedUser) {
      const parsedUser: UserData = JSON.parse(savedUser);
      setUserData(parsedUser);
      setIsLoggedIn(true);
    }
  }, []); // Array vazio = executa apenas na montagem do componente

  /**
   * Manipulador para quando o usuário realiza login com sucesso
   * @param user - Dados do usuário autenticado retornados pela API
   */
  const handleLogin = (user: UserData) => {
    // Armazena dados do usuário para persistência de sessão
    setUserData(user);
    // Marca usuário como logado
    setIsLoggedIn(true);
  };

  /**
   * Manipulador para quando o usuário realiza logout
   * Limpa sessão local e dados do localStorage
   */
  const handleLogout = () => {
    // Remove dados do usuário do localStorage
    localStorage.removeItem("user");
    // Marca usuário como deslogado
    setIsLoggedIn(false);
    // Limpa dados do usuário da memória
    setUserData(null);
  };

  // Renderiza a aplicação baseado no estado de autenticação
  return (
    <div className="size-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Se não está logado ou não há dados do usuário, mostra tela de login */}
      {!isLoggedIn || !userData ? (
        <LoginScreen onLogin={handleLogin} />
      ) : /* Se está logado e é admin, mostra dashboard administrativo */ userData.isAdmin ? (
        <AdminDashboard userData={userData} onLogout={handleLogout} />
      ) : (
        /* Caso contrário, mostra dashboard regular do funcionário */
        <Dashboard userData={userData} onLogout={handleLogout} />
      )}
    </div>
  );
}