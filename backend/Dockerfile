# TROQUE ESTA LINHA:
# FROM node:18-alpine
# POR ESTA: (Agora atualizada para node 22)
FROM node:22

# O resto do arquivo permanece o MESMO
WORKDIR /app

# Copia os arquivos de definição de dependências
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install

# Copia o resto do código da aplicação
COPY . .

# Expõe a porta que a aplicação vai rodar
EXPOSE 5000

# Comando para rodar a aplicação em modo de desenvolvimento
CMD [ "npm", "run", "dev" ]


