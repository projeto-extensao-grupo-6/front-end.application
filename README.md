# front-end.aplication
Este repositório contém uma aplicação front-end desenvolvida em React, criada como parte do projeto de extensão do Grupo 6.

## Como rodar o projeto

1. Instale as dependências:
   ```sh
   npm install
   ```

2. Inicie o front-end:
   ```sh
   npm start
   ```
   ou
   ```sh
   npm run dev
   ```

3. Inicie o JSON Server (em outro terminal):
   ```sh
   npx json-server --watch json_server_db.json --port 3000
   ```

O front-end estará disponível em `http://localhost:5173` e o backend fake (JSON Server) em `http://localhost:3000`