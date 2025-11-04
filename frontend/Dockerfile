# Usar a mesma versão do Node que o backend
FROM node:22

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos de definição de dependências
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código-fonte do frontend
COPY . .

# Expor a porta do Vite
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento do Vite
# O '--host' é CRUCIAL para expor o servidor fora do contêiner
CMD ["npm", "run", "dev", "--", "--host"]
