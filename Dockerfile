FROM zenato/puppeteer

USER root
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 7788
ENTRYPOINT ["node", "index.js"]