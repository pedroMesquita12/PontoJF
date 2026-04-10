import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Package, User, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

/**
 * Tipo de dados do usuário autenticado
 */
type UserData = {
  id: number;              // ID do funcionário
  usuarioId: number;       // ID do usuário
  matricula: string;       // Matrícula do funcionário
  nome: string;            // Nome completo
  email: string;           // Email
  cargo: string;           // Cargo/função
  perfil: string;          // Perfil de acesso
  isAdmin: boolean;        // Flag de administrador
};

/**
 * Props do componente LoginScreen
 */
type LoginScreenProps = {
  onLogin: (user: UserData) => void; // Callback executado após login bem-sucedido
};

// URL base da API (relativamente)
const API_URL = "/api";

/**
 * Função auxiliar para determinar se um usuário é administrador
 * Verifica perfil e cargo contra listas de permissões administrativas
 * @param perfil - Perfil de acesso do usuário
 * @param cargo - Cargo do funcionário
 * @returns true se usuário tem privilégios administrativos
 */
function isAdminUser(perfil?: string, cargo?: string) {
  // Perfis que possuem privilégios de admin
  const perfisAdmin = ["ADMIN", "SUPERADMIN", "GERENTE"];
  // Cargos que possuem privilégios de admin
  const cargosAdmin = ["GERENTE", "SUPERVISOR", "COORDENADOR", "DIRETOR"];

  // Normaliza os valores para comparação
  const perfilNormalizado = (perfil || "").toUpperCase().trim();
  const cargoNormalizado = (cargo || "").toUpperCase().trim();

  // Retorna true se corresponde a qualquer um dos critérios
  return (
    perfisAdmin.includes(perfilNormalizado) ||
    cargosAdmin.includes(cargoNormalizado)
  );
}

/**
 * Componente de Tela de Login (LoginScreen)
 * 
 * Responsabilidades:
 * - Exibir formulário de autenticação
 * - Validar entrada do usuário
 * - Comunicar com API de login
 * - Armazenar dados de sessão
 * - Determinar nível de acesso (admin/funcionário)
 */
export function LoginScreen({ onLogin }: LoginScreenProps) {
  // Estado para matrícula
  const [matricula, setMatricula] = useState("");
  // Estado para senha
  const [senha, setSenha] = useState("");
  // Estado para indicador de carregamento
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Manipulador do formulário de login
   * @param e - Evento do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Previne comportamento padrão do formulário
    e.preventDefault();

    // Validação: verifica se os campos estão preenchidos
    if (!matricula || !senha) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      // Ativa estado de carregamento (desabilita botão)
      setIsLoading(true);

      // Faz requisição para API de login
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

      // Parseia resposta JSON
      const data = await response.json();

      // Verifica se houve erro na resposta
      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      // Extrai cargo e perfil com valores padrão
      const cargo = data.user.cargo ?? "Funcionário";
      const perfil = data.user.perfil ?? "FUNCIONARIO";

      // Monta objeto do usuário
      const user: UserData = {
        id: data.user.id,
        usuarioId: data.user.usuarioId,
        matricula: data.user.matricula,
        nome: data.user.nome,
        email: data.user.email,
        cargo,
        perfil,
        // Determina se usuário é admin baseado em perfil e cargo
        isAdmin: isAdminUser(perfil, cargo),
      };

      // Persiste dados do usuário no localStorage para manter sessão
      localStorage.setItem("user", JSON.stringify(user));

      // Exibe mensagem de sucesso
      toast.success(`Bem-vindo(a), ${user.nome}!`);
      // Chama callback com dados do usuário
      onLogin(user);
    } catch (error) {
      // Extrai mensagem de erro
      const message =
        error instanceof Error ? error.message : "Erro ao fazer login";
      // Exibe mensagem de erro
      toast.error(message);
    } finally {
      // Desativa estado de carregamento (reabilita botão)
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Container principal com animação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header com logo e título */}
        <div className="text-center mb-8">
          {/* Ícone com animação de escala */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center bg-blue-600 text-white p-4 rounded-2xl mb-4 shadow-lg"
          >
            <Package className="size-12" />
          </motion.div>
          {/* Título da aplicação */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Express Encomendas
          </h1>
          {/* Subtítulo */}
          <p className="text-slate-600">Sistema de Ponto Eletrônico</p>
        </div>

        {/* Card do formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com sua matrícula e senha para registrar o ponto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de matrícula */}
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <div className="relative">
                  {/* Ícone de usuário */}
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="pl-10"
                    disabled={isLoading} // Desabilita durante carregamento
                  />
                </div>
              </div>

              {/* Campo de senha */}
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  {/* Ícone de cadeado */}
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10"
                    disabled={isLoading} // Desabilita durante carregamento
                  />
                </div>
              </div>

              {/* Botão de submit */}
              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? (
                  <>
                    {/* Ícone com rotação durante carregamento */}
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