import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";
import { AdminDashboard } from "./components/AdminDashboard";

type UserData = {
  id: number;
  usuarioId: number;
  matricula: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: string;
  isAdmin: boolean;
  token?: string;
  accessToken?: string;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    const parsedUser: UserData = JSON.parse(savedUser);

    setUserData(parsedUser);
    setIsLoggedIn(true);
  }
}, []);

const handleLogin = (user: UserData) => {
  // garante que o token não se perde
  if (user.token) {
    localStorage.setItem("token", user.token);
  } else if (user.accessToken) {
    localStorage.setItem("token", user.accessToken);
  }

  localStorage.setItem("user", JSON.stringify(user));

  setUserData(user);
  setIsLoggedIn(true);
};

const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token"); 

  setIsLoggedIn(false);
  setUserData(null);
};

  return (
    <div className="size-full bg-gradient-to-br from-slate-50 to-slate-100">
      {!isLoggedIn || !userData ? (
        <LoginScreen onLogin={handleLogin} />
      ) : userData.isAdmin ? (
        <AdminDashboard userData={userData} onLogout={handleLogout} />
      ) : (
        <Dashboard userData={userData} onLogout={handleLogout} />
      )}
    </div>
  );
}