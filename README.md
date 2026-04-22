


# LogiControl

Plataforma de Gestão Operacional e Controle de Ponto

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Backend](https://img.shields.io/badge/backend-NestJS-red)
![Frontend](https://img.shields.io/badge/frontend-React-blue)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![License](https://img.shields.io/badge/license-academic-lightgrey)

---




## Sobre o Projeto

O LogiControl é uma plataforma web desenvolvida para gestão operacional de empresas, com foco em controle de ponto eletrônico, monitoramento de colaboradores e rastreamento de pacotes logísticos.

A solução tem como objetivo aumentar a eficiência operacional, garantir rastreabilidade das atividades e fornecer dados estratégicos para apoio à tomada de decisão.

---

## Funcionalidades Principais

| Controle de Ponto | Painel Administrativo | Gestão de Pacotes | Relatórios e Indicadores |
|------------------|----------------------|------------------|--------------------------|
| Registro de entrada, saída e pausas | Visão geral da operação | Registro de entrada e saída | Relatórios operacionais |
| Cálculo automático de horas | Monitoramento em tempo real | Rastreamento por código | Análise de produtividade |
| Status em tempo real | Indicadores de desempenho | Associação automática ao operador | Dados consolidados |
| Histórico por data | Controle de usuários | Histórico detalhado | Exportação de relatórios |

---

## Tecnologias Utilizadas

| Frontend | Backend | Banco de Dados | Infraestrutura |
|----------|--------|----------------|----------------|
| React | NestJS | PostgreSQL | Vercel |
| TypeScript | TypeScript | Supabase | Railway |
| Vite | Prisma ORM |  |  |
| Tailwind CSS |  |  |  |

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


cd backend
npm install
npm run start:dev


---

### Frontend


cd frontend
npm install
npm run dev


---

## Configuração de Ambiente

### Backend (.env)


DATABASE_URL=
JWT_SECRET=
PORT=3000


---

### Frontend (.env)


VITE_API_URL=


---

## API (Documentação)

A API segue padrão REST e pode ser documentada via Swagger.

### Endpoints principais:

#### Autenticação

POST /auth/login


#### Admin

GET /admin/overview
GET /admin/ponto/funcionarios


#### Pacotes

POST /pacotes
GET /pacotes


---

### Swagger (Recomendado)

Se quiser ativar no NestJS:

```ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('LogiControl API')
  .setDescription('Documentação da API')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

Acesse em:

http://localhost:3000/api
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
Deploy

Frontend: https://logicontrol-weld.vercel.app/

Backend: https://pontojf-production.up.railway.app

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
