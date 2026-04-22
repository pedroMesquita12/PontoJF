# LogiControl
### Plataforma de Gestão Operacional e Controle de Ponto

---

##  Visão Geral

O **LogiControl** é uma plataforma corporativa voltada para a gestão integrada de operações internas, com foco em controle de ponto eletrônico, monitoramento de colaboradores e rastreamento de pacotes logísticos.

A solução foi desenvolvida para atender ambientes que exigem **controle rigoroso, rastreabilidade e visibilidade em tempo real**, proporcionando maior eficiência operacional e suporte à tomada de decisões estratégicas.

---

##  Objetivo do Produto

Centralizar e automatizar processos operacionais críticos, reduzindo erros manuais, aumentando a produtividade e garantindo maior transparência nas atividades da organização.

---

##  Principais Módulos

###  Controle de Ponto
- Registro eletrônico de jornada (entrada, saída e pausas)
- Cálculo automático de horas trabalhadas
- Status operacional em tempo real dos colaboradores
- Histórico completo por data

---

### 👨‍💼 Painel Administrativo
- Visão consolidada da operação
- Monitoramento em tempo real dos colaboradores
- Indicadores operacionais e de desempenho
- Controle de acesso por perfil

---

###  Gestão de Pacotes
- Registro de movimentação (entrada/saída)
- Rastreamento de pacotes por código
- Associação automática com operador responsável
- Histórico detalhado de operações logísticas

---

###  Relatórios e Indicadores
- Relatórios operacionais detalhados
- Análise de produtividade
- Consolidação de dados para tomada de decisão

---

##  Segurança e Controle de Acesso

O sistema utiliza autenticação baseada em tokens (JWT), garantindo segurança e controle de permissões.

Perfis disponíveis:
- **Administrador (DONO):** acesso completo ao sistema
- **Colaborador:** acesso restrito às funcionalidades operacionais

---

##  Arquitetura da Solução

A aplicação segue uma arquitetura moderna baseada em separação de responsabilidades:

- **Frontend:** Interface web responsiva e reativa
- **Backend:** API REST estruturada e segura
- **Banco de Dados:** Persistência relacional otimizada

---

##  Tecnologias Utilizadas

### Frontend
- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}

### Backend
- :contentReference[oaicite:3]{index=3}
- :contentReference[oaicite:4]{index=4}

### Banco de Dados
- :contentReference[oaicite:5]{index=5}
- :contentReference[oaicite:6]{index=6}

### Infraestrutura e Deploy
- :contentReference[oaicite:7]{index=7}
- :contentReference[oaicite:8]{index=8}

---

##  Estrutura do Projeto


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

##  Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Gerenciador de pacotes (npm ou yarn)

---

###  Backend

```bash
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

 Fluxo Operacional Simplificado
Usuário realiza autenticação no sistema
Sistema valida credenciais e gera token JWT
Operações são realizadas com base no perfil do usuário
Todas as ações são registradas e vinculadas ao usuário autenticado
Dados são disponibilizados em tempo real no painel administrativo

 Diferenciais da Solução
Arquitetura escalável e modular
Registro automático de responsabilidade operacional
Monitoramento em tempo real
Redução de erros humanos
Integração entre controle de ponto e logística

 Roadmap (Evolução do Produto)
Integração com leitores de código de barras
Implementação de WebSockets para atualização em tempo real
Dashboard analítico avançado
Sistema de notificações automáticas
Controle de estoque integrado

 Licença

Uso acadêmico e demonstração técnica.

 Desenvolvimento

Projeto desenvolvido por Pedro Mesquita, com foco em soluções modernas para gestão operacional e automação de processos empresariais.
