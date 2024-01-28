FROM node:alpine

WORKDIR /app

COPY package.json .
COPY . .

RUN npm install

COPY . .

CMD ["npm", "start"]
