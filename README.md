# LogiControl

Plataforma de Gestão Operacional e Controle de Ponto

Versão: 1.0.0

---

## Sobre o Projeto

O LogiControl é uma plataforma web desenvolvida para gestão operacional de empresas, com foco em controle de ponto eletrônico, monitoramento de colaboradores e rastreamento de pacotes logísticos.

A solução tem como objetivo aumentar a eficiência operacional, garantir rastreabilidade das atividades e fornecer dados estratégicos para apoio à tomada de decisão.

---

## Funcionalidades Principais

### Controle de Ponto
- Registro de entrada, saída e pausas
- Cálculo automático de horas trabalhadas
- Status em tempo real
- Histórico completo por data

### Painel Administrativo
- Visão geral da operação
- Monitoramento em tempo real
- Indicadores de desempenho
- Controle de usuários e permissões

### Gestão de Pacotes
- Registro de entrada e saída
- Rastreamento por código
- Associação automática ao operador
- Histórico detalhado

### Relatórios e Indicadores
- Relatórios operacionais
- Análise de produtividade
- Dados consolidados
- Exportação de relatórios

---

## Tecnologias Utilizadas

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- NestJS
- TypeScript
- Prisma ORM

### Banco de Dados
- PostgreSQL
- Supabase

### Infraestrutura e Deploy
- Vercel (Frontend)
- Railway (Backend)

---

## Estrutura do Projeto


logiControl/
│
├── backend/
│ ├── src/
│ ├── prisma/
│ └── modules/
│
├── frontend/
│ ├── src/
│ ├── components/
│ └── pages/
│
└── README.md


---

## Instalação e Execução

### Pré-requisitos
- Node.js 18 ou superior
- npm ou yarn

---

### Backend

```bash
Backend
cd backend
npm install
npm run start:dev

Frontend
cd frontend
npm install
npm run dev

Configuração de Ambiente

Backend (.env)
DATABASE_URL=
JWT_SECRET=
PORT=3000

Frontend (.env)
VITE_API_URL=

Fluxo Operacional
Usuário realiza login no sistema
O backend valida as credenciais
Um token JWT é gerado
Todas as ações são vinculadas ao usuário autenticado
Os dados são exibidos em tempo real no painel administrativo

Segurança
Autenticação baseada em JWT
Controle de acesso por perfil
Proteção de rotas no backend

Roadmap
Integração com leitor de código de barras
Atualização em tempo real com WebSockets
Dashboard analítico avançado
Sistema de notificações
Controle de estoque integrado

Licença

Uso acadêmico e demonstração técnica.

Autor

Pedro Mesquita
