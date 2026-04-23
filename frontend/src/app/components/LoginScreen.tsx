import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Package,
  User,
  Lock,
  LogIn,
  AlertCircle,
  Shield,
  Clock3,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

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

type LoginScreenProps = {
  onLogin: (user: UserData) => void;
};

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

function isAdminUser(perfil?: string) {
  return (perfil || "").toUpperCase().trim() === "DONO";
}

function getMensagemErroLogin(message: string) {
  const texto = message.toLowerCase();

  if (
    texto.includes("unauthorized") ||
    texto.includes("credenciais") ||
    texto.includes("inválid") ||
    texto.includes("invalid") ||
    texto.includes("senha") ||
    texto.includes("matrícula")
  ) {
    return "Matrícula ou senha inválida. Verifique os dados e tente novamente.";
  }

  if (
    texto.includes("blocked") ||
    texto.includes("inativo") ||
    texto.includes("desativado")
  ) {
    return "Seu acesso está inativo. Entre em contato com o administrador.";
  }

  if (
    texto.includes("failed to fetch") ||
    texto.includes("network") ||
    texto.includes("cors")
  ) {
    return "Não foi possível conectar ao servidor. Tente novamente em instantes.";
  }

  return message || "Não foi possível fazer login. Tente novamente.";
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin("");

    if (!matricula || !senha) {
      const mensagem = "Por favor, preencha matrícula e senha.";
      setErroLogin(mensagem);
      toast.error(mensagem);
      return;
    }

    try {
      setIsLoading(true);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricula,
          senha,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao fazer login");
      }

      const cargo = data?.user?.cargo ?? "Funcionário";
      const perfil = data?.user?.perfil ?? "FUNCIONARIO";

      const user: UserData = {
        id: Number(data.user.id),
        usuarioId: Number(data.user.usuarioId),
        matricula: String(data.user.matricula),
        nome: String(data.user.nome),
        email: String(data.user.email),
        cargo: String(cargo),
        perfil: String(perfil).toUpperCase().trim(),
        isAdmin: isAdminUser(perfil),
        token: data.accessToken,
        accessToken: data.accessToken,
      };

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", data.accessToken);

      if (lembrarMe) {
        localStorage.setItem("ultimaMatricula", matricula);
      } else {
        localStorage.removeItem("ultimaMatricula");
      }

      toast.success(`Bem-vindo(a), ${user.nome}!`);
      onLogin(user);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      const message =
        error instanceof Error ? error.message : "Erro ao fazer login";

      const mensagemAmigavel = getMensagemErroLogin(message);
      setErroLogin(mensagemAmigavel);
      toast.error(mensagemAmigavel);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_35%),linear-gradient(180deg,#1c174e_0%,#191544_100%)] lg:flex"
        >
          <div className="absolute inset-0">
            <div className="absolute left-[-120px] top-[180px] h-[340px] w-[340px] rounded-full border border-white/5" />
            <div className="absolute bottom-[-130px] left-[-80px] h-[260px] w-[260px] rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute right-[-60px] top-[80px] h-[280px] w-[280px] rounded-[48px] border border-indigo-400/10" />
            <div className="absolute bottom-16 left-24 grid grid-cols-4 gap-3 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-indigo-200"
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between px-16 py-14 text-white">
            <div className="max-w-md">
              <div className="mb-10 inline-flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-violet-900/30">
                <Package className="h-14 w-14" />
              </div>

              <h1 className="text-6xl font-bold tracking-tight">
                Logi<span className="text-violet-400">Control</span>
              </h1>

              <p className="mt-4 text-3xl font-medium text-white/88">
                Sistema de Ponto Eletrônico
              </p>

              <div className="mt-8 h-1 w-16 rounded-full bg-violet-500" />

              <p className="mt-10 max-w-sm text-xl leading-9 text-white/78">
                Gerencie e registre o ponto eletrônico de forma simples, segura
                e eficiente.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-white/10">
                  <Shield className="h-7 w-7 text-violet-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Seguro</h3>
                  <p className="mt-2 text-lg leading-8 text-white/70">
                    Seus dados protegidos
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-white/10">
                  <Clock3 className="h-7 w-7 text-violet-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Confiável</h3>
                  <p className="mt-2 text-lg leading-8 text-white/70">
                    Registros precisos e em tempo real
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-white/10">
                  <BarChart3 className="h-7 w-7 text-violet-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Inteligente</h3>
                  <p className="mt-2 text-lg leading-8 text-white/70">
                    Relatórios e insights na medida certa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="relative flex items-center justify-center overflow-hidden px-6 py-10 sm:px-10"
        >
          <div className="absolute inset-0">
            <div className="absolute right-[-120px] top-[-80px] h-[260px] w-[260px] rounded-full border border-violet-200/70" />
            <div className="absolute bottom-[-80px] right-[-30px] h-[320px] w-[320px] rounded-full border border-violet-100" />
          </div>

          <div className="relative z-10 w-full max-w-[540px]">
            <div className="rounded-[28px] border border-slate-200/70 bg-white/95 p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-300/40">
                  <Package className="h-10 w-10" />
                </div>

                <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                  Bem-vindo ao{" "}
                  <span className="text-violet-600">LogiControl</span>
                </h2>

                <p className="mt-3 text-lg text-slate-500">
                  Acesse sua conta para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {erroLogin && (
                  <Alert variant="destructive" className="border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Não foi possível entrar</AlertTitle>
                    <AlertDescription>{erroLogin}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="matricula"
                    className="text-sm font-semibold text-slate-600"
                  >
                    Matrícula
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="matricula"
                      type="text"
                      placeholder="Digite sua matrícula"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 pl-12 text-base focus-visible:ring-2 focus-visible:ring-violet-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="senha"
                    className="text-sm font-semibold text-slate-600"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 pl-12 pr-12 text-base focus-visible:ring-2 focus-visible:ring-violet-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={
                        mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {mostrarSenha ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1 text-sm">
                  <label className="flex items-center gap-2 text-slate-500">
                    <input
                      type="checkbox"
                      checked={lembrarMe}
                      onChange={(e) => setLembrarMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    Lembrar-me
                  </label>

                  <button
                    type="button"
                    className="font-medium text-violet-600 transition hover:text-violet-700"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-base font-semibold text-white shadow-lg shadow-violet-300/30 transition hover:from-indigo-700 hover:to-violet-700"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mr-2"
                      >
                        <LogIn className="h-5 w-5" />
                      </motion.div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Entrar
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-sm text-slate-400">ou</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="h-14 w-full rounded-xl border-violet-200 text-base font-medium text-violet-600 hover:bg-violet-50"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Acessar com SSO
                </Button>
              </form>
            </div>

            <div className="mt-8 text-center text-sm text-slate-500">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Conexão segura e criptografada</span>
              </div>
              <p>LogiControl © 2026 - Todos os direitos reservados.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
