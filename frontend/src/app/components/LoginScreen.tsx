import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Package, User, Lock, LogIn, AlertCircle } from "lucide-react";
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

  if (texto.includes("blocked") || texto.includes("inativo") || texto.includes("desativado")) {
    return "Seu acesso está inativo. Entre em contato com o administrador.";
  }

  if (texto.includes("failed to fetch") || texto.includes("network") || texto.includes("cors")) {
    return "Não foi possível conectar ao servidor. Tente novamente em instantes.";
  }

  return message || "Não foi possível fazer login. Tente novamente.";
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      const cargo = data.user.cargo ?? "Funcionário";
      const perfil = data.user.perfil ?? "FUNCIONARIO";

      const user: UserData = {
        id: data.user.id,
        usuarioId: data.user.usuarioId,
        matricula: data.user.matricula,
        nome: data.user.nome,
        email: data.user.email,
        cargo,
        perfil,
        isAdmin: isAdminUser(perfil),
        token: data.accessToken,
        accessToken: data.accessToken,
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", data.accessToken);

      toast.success(`Bem-vindo(a), ${user.nome}!`);
      onLogin(user);
    } catch (error) {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center bg-blue-600 text-white p-4 rounded-2xl mb-4 shadow-lg"
          >
            <Package className="size-12" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Express Encomendas
          </h1>
          <p className="text-slate-600">Sistema de Ponto Eletrônico</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com sua matrícula e senha para registrar o ponto
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {erroLogin && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Não foi possível entrar</AlertTitle>
                  <AlertDescription>{erroLogin}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <LogIn className="size-4" />
                    </motion.div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 size-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}