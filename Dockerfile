FROM node:18

WORKDIR /app

COPY app/ .
COPY build/ .
COPY package*.json ./
COPY tsconfig.json .
COPY .env.docker .env

#COPY crypto/ .
#COPY bot.json .

RUN ["npm", "ci"]
RUN ["npm", "run", "build"]

CMD ["npm", "start"]
