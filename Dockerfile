FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 7788
ENTRYPOINT ["node", "index.js"]