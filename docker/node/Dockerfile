FROM node:latest

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install --loglevel=warn;

COPY . .
RUN ls -l
CMD [ "npm", "start" ]