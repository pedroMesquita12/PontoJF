import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Package,
  Scan,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  User,
  MapPin,
  Hash,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

/**
 * Dados do usuário
 */
type UserData = {
  matricula: string;
  nome: string;
  cargo: string;
};

/**
 * Props do componente PackageEntry
 */
type PackageEntryProps = {
  userData: UserData; // Dados do usuário logado
};

/**
 * Tipo para item de pacote registrado
 */
type PackageItem = {
  id: string;              // ID único (UUID)
  codigo: string;          // Código/tracking do pacote
  destinatario: string;    // Nome do destinatário
  endereco: string;        // Endereço de entrega
  timestamp: Date;         // Data/hora do registro
};

/**
 * Componente Entrada de Pacotes (PackageEntry)
 * 
 * Responsabilidades:
 * - Permitir registro de pacotes recebidos
 * - Validar dados de entrada
 * - Exibir lista de pacotes registrados
 * - Suporte para scan de código (futuro)
 * 
 * Funcionalidades:
 * 1. Formulário: Código, destinatário, endereço
 * 2. Validação: Todos os campos obrigatórios
 * 3. Armazenamento local: Persiste na sessão
 * 4. Listagem: Exibe pacotes registrados
 */
export function PackageEntry({ userData }: PackageEntryProps) {
  // Estado: Código do pacote
  const [codigo, setCodigo] = useState("");
  // Estado: Nome do destinatário
  const [destinatario, setDestinatario] = useState("");
  // Estado: Endereço de entrega
  const [endereco, setEndereco] = useState("");
  // Estado: Lista de pacotes registrados
  const [packages, setPackages] = useState<PackageItem[]>([]);
  // Estado: Indicador de scanning (futuro)
  const [isScanning, setIsScanning] = useState(false);

  /**
   * Manipulador do formulário de registro de pacote
   * Valida dados, cria novo pacote e adiciona à lista
   */
  const handleSubmit = (e: React.FormEvent) => {
    // Previne comportamento padrão
    e.preventDefault();

    // Validação: Todos os campos obrigatórios
    if (!codigo || !destinatario || !endereco) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Cria novo pacote
    const newPackage: PackageItem = {
      id: crypto.randomUUID(), // Gera ID único
      codigo,
      destinatario,
      endereco,
      timestamp: new Date(), // Data/hora atual
    };

    setPackages([newPackage, ...packages]);

    toast.success("Pacote registrado com sucesso!", {
      description: `Código: ${codigo}`,
    });

    // Limpar formulário
    setCodigo("");
    setDestinatario("");
    setEndereco("");
  };

  const handleScan = () => {
    setIsScanning(true);
    
    // Simular escaneamento de código de barras
    setTimeout(() => {
      const randomCode = `PKG-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setCodigo(randomCode);
      setIsScanning(false);
      toast.success("Código escaneado com sucesso!");
    }, 1500);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const todayCount = packages.filter((pkg) => {
    const today = new Date().toDateString();
    return pkg.timestamp.toDateString() === today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Entrada de Pacotes</h2>
          <p className="text-slate-600 mt-1">Registre pacotes recebidos no sistema</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Package className="size-4" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{todayCount}</div>
              <p className="text-xs text-slate-600 mt-1">Pacotes registrados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <PackageCheck className="size-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{packages.length}</div>
              <p className="text-xs text-slate-600 mt-1">Todos os registros</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <User className="size-4" />
                Operador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-slate-900 truncate">{userData.nome}</div>
              <p className="text-xs text-slate-600 mt-1">Mat. {userData.matricula}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Registration Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5 text-blue-600" />
              Registrar Novo Pacote
            </CardTitle>
            <CardDescription>
              Preencha as informações ou escaneie o código de barras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código do Pacote</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="codigo"
                      placeholder="Ex: PKG-1234"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="pl-10"
                      disabled={isScanning}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleScan}
                    disabled={isScanning}
                    className="gap-2"
                  >
                    {isScanning ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Scan className="size-4" />
                        </motion.div>
                        Escaneando...
                      </>
                    ) : (
                      <>
                        <Scan className="size-4" />
                        Escanear
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinatario">Destinatário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="destinatario"
                    placeholder="Nome completo"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço de Entrega</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base gap-2">
                <PackageCheck className="size-5" />
                Registrar Pacote
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Packages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Pacotes Registrados Recentemente</CardTitle>
            <CardDescription>
              Últimos {packages.length} {packages.length === 1 ? "pacote registrado" : "pacotes registrados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="size-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Nenhum pacote registrado ainda</p>
                <p className="text-sm text-slate-500 mt-1">
                  Comece registrando um novo pacote acima
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {packages.slice(0, 10).map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 bg-white"
                    >
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="size-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-semibold text-slate-900">
                            {pkg.codigo}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Registrado
                          </Badge>
                        </div>
                        <p className="font-medium text-slate-900">{pkg.destinatario}</p>
                        <div className="flex items-start gap-2 text-sm text-slate-600 mt-1">
                          <MapPin className="size-4 mt-0.5 flex-shrink-0" />
                          <span>{pkg.endereco}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-600">Registrado em</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">
                          {formatTimestamp(pkg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
