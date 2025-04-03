# 📩 Aplicação de Mensageria com WebSocket

Este projeto é um sistema de mensagens em tempo real utilizando Vue.js 3 no frontend e Node.js com Express e WebSocket no backend. Ele permite o envio e recebimento de mensagens instantâneas, garantindo uma comunicação eficiente entre usuários.

O sistema é totalmente containerizado utilizando Docker para facilitar a instalação e execução. Além disso, empregamos MongoDB como banco de dados para armazenar mensagens e RabbitMQ para gerenciar filas de mensagens de forma eficiente.

# 🚀 Tecnologias Utilizadas

## Frontend (Interface do usuário)

* Vue.js 3 – Framework JavaScript para construção da interface

* Vite – Ferramenta para desenvolvimento rápido de aplicações Vue

* Backend (Servidor e API)

* Node.js – Ambiente de execução para JavaScript no backend

* Express.js – Framework para criação de APIs

* WebSocket (ws) – Protocolo para comunicação em tempo real

* MongoDB – Banco de dados NoSQL para armazenar mensagens

* RabbitMQ – Mensageria para gerenciamento de filas
![Interface da Aplicação](/assests/telavue.jpeg)


# Infraestrutura

* Docker – Contêineres para rodar toda a aplicação de forma isolada

* Docker Compose – Gerenciamento de múltiplos serviços da aplicação

# 🛠️ Instalação e Configuração

![Interface da Aplicação](/assests/docker.jpeg)


## 1️⃣ Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas em seu sistema:

* Node.js (v18 ou superior)

* Docker e Docker Compose

* VS Code (opcional) – Recomendado para desenvolvimento

![Interface da Aplicação](/assests/codigo.jpeg)

![Interface da Aplicação](/assests/rabbitMQ.jpeg)

# 2️⃣ Configuração e Execução

🔹 Rodando com Docker (Recomendado)
Clone este repositório:

sh
Copiar
Editar
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
Suba os contêineres com Docker Compose:

sh
Copiar
Editar
docker-compose up -d
Acesse a aplicação:

Frontend: http://localhost:8080

Backend: http://localhost:3000
