FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm install ganache-cli
EXPOSE 8080
CMD ["nodemon", "server.js"]