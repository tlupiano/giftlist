# GiftList - Gerenciador de Listas de Presentes

**GiftList** é uma aplicação full-stack projetada para criar, gerenciar e compartilhar listas de presentes de forma colaborativa e em tempo real. A plataforma é ideal para eventos como chás de bebê, listas de casamento, aniversários e mais.

## ✨ Funcionalidades Principais

*   **Autenticação de Usuários:** Sistema seguro de registro e login com tokens JWT.
*   **Criação de Listas:** Crie listas personalizadas do zero ou a partir de templates pré-definidos (ex: Chá de Bebê, Casamento).
*   **Gerenciamento Completo:** Adicione, edite, remova e reordene itens e categorias.
*   **Deleção de Listas:** O dono da lista pode deletar suas listas de presentes.
*   **Personalização de Categorias:** Adicione ícones (emojis) para identificar visualmente cada categoria.
*   **Interação de Convidados:** Convidados podem visualizar listas, marcar itens como "reservados" ou "comprados".
*   **Atualizações em Tempo Real:** A interface é atualizada instantaneamente para todos os usuários (dono e convidados) usando WebSockets (Socket.io).
*   **Modo de Gerenciamento:** O dono da lista possui uma visão administrativa para confirmar presentes, gerenciar a lista e ver o progresso de itens comprados.
*   **Envio de E-mails:** Funcionalidade para enviar e-mails de agradecimento aos convidados que compraram um presente.
*   **Upload de Imagens Aprimorado:** Suporte para arrastar e soltar (drag-and-drop), compressão no lado do cliente e pré-visualização de imagens para os itens.
*   **Melhorias de UX:** Edição de categorias "in-loco" (direto na página), geração automática de URL (slug) com edição manual, e uso de notificações (toasts) para feedback ao usuário.
*   **Ambientes Separados:** Configurações otimizadas e isoladas para desenvolvimento e produção usando Docker.

## 🚀 Tecnologias Utilizadas

*   **Backend:** Node.js, Express, Prisma (ORM), PostgreSQL, Socket.io, JWT
*   **Frontend:** React (com Vite), React Router, Tailwind CSS, Socket.io Client
*   **Containerização:** Docker, Docker Compose

## 📂 Estrutura do Projeto

A estrutura foi organizada para separar claramente os ambientes de desenvolvimento e produção, utilizando `Dockerfile`s específicos para cada cenário.

```
giftlist/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── Dockerfile           # Configuração para desenvolvimento (com Nodemon)
│   └── Dockerfile.prod      # Configuração para produção (otimizada)
├── frontend/
│   ├── src/
│   ├── Dockerfile           # Configuração para desenvolvimento (servidor Vite)
│   └── Dockerfile.prod      # Configuração para produção (multi-stage com Nginx)
├── .env.example
├── .env                   # (Não versionado)
├── .env.prod              # (Não versionado)
├── docker-compose.yml       # Configuração de DEV
├── docker-compose.prod.yml  # Configuração de PROD
└── README.md
```

## ⚙️ Configuração e Execução

A aplicação é totalmente containerizada com Docker, facilitando a configuração e execução dos ambientes de desenvolvimento e produção.

### 1. Pré-requisitos

*   [Docker](https://www.docker.com/get-started) e [Docker Compose](https://docs.docker.com/compose/install/) instalados.

### 2. Variáveis de Ambiente

Antes de iniciar, você precisa criar os arquivos de variáveis de ambiente.

1.  **Para Desenvolvimento:** Copie o arquivo `.env.example` para um novo arquivo chamado `.env` e preencha as variáveis necessárias.
    ```dotenv
    # .env
    ```
2.  **Para Produção:** Crie um arquivo `.env.prod` na raiz do projeto com valores seguros e apropriados para o ambiente de produção.
    ```dotenv
    # .env.prod
    ```
### 3. Rodando em Modo de Desenvolvimento

Este modo utiliza `Nodemon` no backend e o servidor de desenvolvimento do `Vite` no frontend para permitir hot-reloading, ideal para desenvolver novas funcionalidades.

**Passo 1: Iniciar os contêineres**

Na raiz do projeto, rode o comando para iniciar todos os serviços em segundo plano:

```bash
docker compose up --build -d
```

**Passo 2: Rodar as Migrações do Banco**

Na primeira vez que você rodar o projeto (ou sempre que houver uma alteração no schema do banco), execute as migrações do Prisma:

```bash
docker compose exec backend npx prisma migrate dev
```
**Passo 3 (Opcional): Popular o Banco com Dados Iniciais** 

Para adicionar os templates de lista (ex: Chá de Bebê, Casamento) ao banco de dados para que apareçam na tela de criação de listas, rode o script de "seed": 
```bash 
docker compose exec backend npm run prisma:seed
```

**Acesso:**
*   **Frontend:** http://localhost:5173
*   **Backend API:** http://localhost:5000/api

### 4. Rodando em Modo de Produção

Este modo utiliza imagens otimizadas e o Nginx para servir o frontend. O comando `docker-compose.prod.yml` já executa as migrações automaticamente ao iniciar o contêiner do backend.

```bash
docker compose -f docker-compose.prod.yml up --build -d
```
