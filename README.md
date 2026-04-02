 Sistema de Ponto e Gestão Operacional

Este projeto é um sistema web completo para controle de ponto eletrônico e gestão operacional de uma agência, integrando registro de jornada dos funcionários, movimentação de pacotes e acompanhamento de relatórios de orçamento em uma única plataforma.

A aplicação foi construída com React + Vite + Tailwind no frontend, NestJS no backend e Prisma ORM com PostgreSQL (Supabase) para persistência dos dados, garantindo uma arquitetura moderna, escalável e organizada.

 Visão Geral

O sistema permite que funcionários registrem seus horários de trabalho de forma simples, enquanto a administração acompanha em tempo real a operação da empresa. Além do controle de ponto, o sistema também contempla o fluxo de entrada e saída de pacotes da agência, bem como a visualização de relatórios relacionados a orçamentos e desempenho operacional.

No login, o usuário é automaticamente direcionado conforme seu nível de acesso. Perfis administrativos têm acesso a um painel completo de gestão, enquanto usuários comuns acessam apenas seu dashboard individual.

 Funcionalidades

No módulo de ponto, os funcionários podem registrar eventos como entrada, saída para almoço, retorno e saída final. O sistema interpreta esses registros para determinar automaticamente o status atual de cada funcionário (trabalhando, em pausa ou fora), além de calcular horas trabalhadas, tempo de pausa e jornada semanal.

Para a administração, existe um painel que centraliza todas essas informações em tempo real, exibindo o histórico diário de cada funcionário e indicadores consolidados como presença, produtividade e distribuição de horas.

Além disso, o sistema inclui um controle operacional da agência, permitindo o acompanhamento da entrada e saída de pacotes. Essa funcionalidade possibilita registrar movimentações, acompanhar fluxo logístico e manter visibilidade sobre a operação diária.

Outro ponto importante é a área de relatórios, onde são exibidos dados relacionados a orçamentos e desempenho. Esses relatórios permitem uma visão mais estratégica do negócio, auxiliando na análise de produtividade, volume de operações e tomada de decisão.

 Regras de Funcionamento

O status do funcionário é determinado automaticamente com base no último registro realizado no dia. Registros de entrada ou retorno indicam que o funcionário está trabalhando, enquanto saídas para almoço indicam pausa e a saída final indica que o expediente foi encerrado.

Internamente, os tipos de registro são padronizados e mapeados entre backend e frontend, garantindo consistência na exibição dos dados e no cálculo das métricas.

 Integração e API

O backend expõe endpoints responsáveis tanto pela autenticação quanto pela gestão administrativa. Entre eles, destacam-se os endpoints que retornam os registros de ponto dos funcionários e o overview geral do sistema, utilizado para alimentar os dashboards com dados reais.

 Arquitetura

O projeto segue uma separação clara entre frontend e backend. No backend, os módulos são organizados por domínio (como autenticação, funcionários, ponto e administração), enquanto o frontend utiliza componentes reutilizáveis e páginas estruturadas para cada área do sistema.

A comunicação entre as camadas é feita via API REST, com tratamento de dados no backend e renderização dinâmica no frontend.

 Execução do Projeto

Para rodar o projeto localmente, basta instalar as dependências em cada parte da aplicação e iniciar os servidores de desenvolvimento:

# Backend
cd backend
npm install
npx prisma generate
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev

 Status do Projeto

O sistema já conta com autenticação funcional, painel administrativo integrado ao banco de dados, controle completo de ponto com cálculo automático de jornada e uma base sólida para gestão operacional da agência, incluindo movimentação de pacotes e relatórios de orçamento.

O projeto continua em evolução, com foco em melhorias de interface, novos relatórios e possíveis integrações externas.
