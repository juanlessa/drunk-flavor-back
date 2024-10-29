FROM node:22

WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app
RUN npm run build
EXPOSE 3333
CMD [ "npm", "start" ]
