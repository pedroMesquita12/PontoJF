import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Package, User, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

type UserData = {
  matricula: string;
  nome: string;
  cargo: string;
};

type LoginScreenProps = {
  onLogin: (user: UserData) => void;
};

// Mock database de usuários
const mockUsers: Record<string, { senha: string; nome: string; cargo: string }> = {
  "001": { senha: "123456", nome: "João Silva", cargo: "Entregador" },
  "002": { senha: "123456", nome: "Maria Santos", cargo: "Motorista" },
  "003": { senha: "123456", nome: "Pedro Oliveira", cargo: "Supervisor" },
  "004": { senha: "123456", nome: "Ana Costa", cargo: "Entregadora" },
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!matricula || !senha) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      const user = mockUsers[matricula];

      if (!user) {
        toast.error("Matrícula não encontrada");
        setIsLoading(false);
        return;
      }

      if (user.senha !== senha) {
        toast.error("Senha incorreta");
        setIsLoading(false);
        return;
      }

      toast.success(`Bem-vindo(a), ${user.nome}!`);
      onLogin({
        matricula,
        nome: user.nome,
        cargo: user.cargo,
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center bg-blue-600 text-white p-4 rounded-2xl mb-4 shadow-lg"
          >
            <Package className="size-12" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Express Encomendas</h1>
          <p className="text-slate-600">Sistema de Ponto Eletrônico</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com sua matrícula e senha para registrar o ponto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-sm text-blue-900 font-medium mb-2">Usuários de demonstração:</p>
          <div className="text-xs text-blue-800 space-y-1">
            <p>• Matrícula: <span className="font-mono font-semibold">001</span> | Senha: <span className="font-mono font-semibold">123456</span> (João Silva - Entregador)</p>
            <p>• Matrícula: <span className="font-mono font-semibold">002</span> | Senha: <span className="font-mono font-semibold">123456</span> (Maria Santos - Motorista)</p>
            <p>• Matrícula: <span className="font-mono font-semibold">003</span> | Senha: <span className="font-mono font-semibold">123456</span> (Pedro Oliveira - Supervisor)</p>
            <p>• Matrícula: <span className="font-mono font-semibold">004</span> | Senha: <span className="font-mono font-semibold">123456</span> (Ana Costa - Entregadora)</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}