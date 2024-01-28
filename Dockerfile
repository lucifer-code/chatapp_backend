FROM node:alpine

WORKDIR /app

COPY package.json .
COPY . .

RUN npm install

COPY . .
EXPOSE 5000

CMD ["npm", "start"]
