# Join & Chat – Backend

API RESTful do **Join & Chat**, responsável pelo gerenciamento de usuários, autenticação, convites, conexões e troca de mensagens. Desenvolvida com Node.js, Express e Prisma, utilizando PostgreSQL como banco de dados.

---

## :computer: Requisitos

Antes de começar, certifique-se de ter os seguintes itens instalados na sua máquina:

- [Node.js](https://nodejs.org/) (versão recomendada: LTS)
- [npm](https://www.npmjs.com/) (geralmente já incluído com o Node.js)
- [PostgreSQL](https://www.postgresql.org/) (versão recomendada: 14+)
- Editor de código como [VS Code](https://code.visualstudio.com/) (opcional, mas recomendado)

---

## :gear: Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [JWT](https://jwt.io/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Multer](https://github.com/expressjs/multer)
- [Nodemailer](https://nodemailer.com/)
- [UUID](https://www.npmjs.com/package/uuid)
- [Dotenv](https://github.com/motdotla/dotenv)
- [Date-fns](https://date-fns.org/)
- [Cors](https://www.npmjs.com/package/cors)

---

## :rocket: Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/JonielOliveira/programacao-web-backend.git
```

Entre no diretório do backend:

```bash
cd programacao-web-backend/backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com as informações corretas do seu ambiente:

- Configure a URL do banco de dados PostgreSQL
- Defina as variáveis de autenticação (JWT)
- Ajuste o usuário administrador padrão
- Configure os dados de e-mail se quiser envio automático de mensagens

### 4. Prepare o banco de dados

Execute as migrações do Prisma:

```bash
npm run prisma:migrate
```

Gere o cliente Prisma:

```bash
npm run prisma:generate
```

Visualize o banco com o Prisma Studio (Opcional):

```bash
npm run prisma:studio
```

### 5. Rode o servidor de desenvolvimento

```bash
npm run dev
```

A API estará disponível em:  
[http://localhost:3333](http://localhost:3333)

---

:pencil: **Nota:**  
Por padrão, usamos as seguintes portas nos exemplos deste projeto:

- :door: **3333** para o backend  
- :door: **3000** para o [frontend](https://github.com/JonielOliveira/programacao-web-frontend) (se estiver usando o [projeto frontend](https://github.com/JonielOliveira/programacao-web-frontend))

Esses valores podem ser ajustados no arquivo `.env`, conforme necessário. Verifique se essas portas estão liberadas no firewall da sua máquina se for rodar o projeto na rede local.

---

## :key: Estrutura do .env

Aqui estão as variáveis de ambiente configuráveis no projeto (exemplo):

```env
# api configs
API_HOST="localhost"
API_PORT="3333"

# database configs
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

#jwt configs
JWT_SECRET="segredo"
JWT_EXPIRES_IN="1h"

#admin configs 
ADMIN_USERNAME="admin"
ADMIN_FULLNAME="System Administrator"
ADMIN_EMAIL="admin@exemplo.com"
ADMIN_PASSWORD="123456"

#message configs
MESSAGE_SECRET_KEY="mensagemsupersecreta"

#email configs
SEND_EMAIL="true"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="seuemail@gmail.com"
EMAIL_APP_PASSWORD="suasenhadeaplicativo"
```

---

## :bookmark_tabs: Scripts úteis

- `npm run dev`: inicia o servidor em modo desenvolvimento com `ts-node-dev`
- `npm run prisma:migrate`: roda as migrações no banco
- `npm run prisma:generate`: gera os clientes Prisma
- `npm run prisma:studio`: visualiza o banco de dados via navegador

---
