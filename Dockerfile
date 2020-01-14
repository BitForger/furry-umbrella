FROM node:latest

WORKDIR /home/node

COPY package* ./
COPY tsconfig* ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm","run","start:prod"]
