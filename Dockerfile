FROM node:18

WORKDIR /src
COPY package.json package-lock.json /src/
RUN npm install
COPY . /src
RUN npm run build
EXPOSE 3333
ENV MONGO_HOST="mongodb"
ENV MONGO_DATABASE=""
CMD [ "npm", "start" ]
