FROM node:18-alpine
WORKDIR /app
RUN npm install -g npm@9
COPY package*.json .
COPY packages ./packages
COPY themes ./themes
COPY extensions ./extensions
COPY config ./config
COPY translations ./translations
RUN mkdir -p public media
RUN npm install
RUN npm run compile -w @evershop/postgres-query-builder
RUN npm run compile -w admin_ptbr
RUN npm run compile -w catalog_shop
RUN npm run compile
RUN npm run build

EXPOSE 80
CMD ["npm", "run", "start"]
