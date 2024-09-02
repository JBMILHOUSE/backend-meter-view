## :clipboard: Sobre o Projeto

Este projeto é um serviço para gerenciar a leitura individualizada de consumo de água e gás. Para facilitar a coleta das informações, o serviço utiliza inteligência artificial (IA) para obter a medição através da foto de uma conta.

## 🛠️ Tecnologias Utilizadas

- **Back-End**
  - Fastify
  - Typescript
  - Prisma
  - Zod
  - SQLite

## :pushpin: Rotas
#### POST
- ``/upload`` Rota responsável por fazer o upload de uma imagem de um medidor e obter a leitura do consumo de água ou gás utilizando IA.

#### GET
- ``/:customer_code/list`` Rota que lista as leituras realizadas por um cliente específico.
- ``/:customer_code/list?measure_type=`` filtragem por tipo de medição (WATER ou GAS)

#### PATCH
- ``/confirm`` Rota que permite confirmar o valor de uma leitura específica.


## 🚀 Como Utilizar

### Passo a Passo

```
# Clone este repositório
> git clone https://github.com/JBMILHOUSE/backend-meter-view.git

# Acesse a pasta do projeto qual terminal de sua preferência
> cd backend-meter-view 

# Instalar as dependências
> npm i

# Crie um arquivo .env na raiz do projeto e configure as seguintes variáveis:
> API_KEY=your_google_gemini_api_key

# Executar as migrações do banco de dados
> npx prisma migrate dev

# Iniciar a aplicação
> npm run dev

```

A aplicação estará disponível em `http://localhost:3333`.

---

<h4 align="center">
    Made with 💜 by <a href="https://br.linkedin.com/in/chris-oliveira-alexandre/" target="_blank">Chris</a>
</h4>
