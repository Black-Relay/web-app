FROM node:24-alpine AS install-deps
WORKDIR /src/app
COPY package*.json ./
RUN npm install

FROM node:24-alpine AS devenv
WORKDIR /src/app
COPY --from=install-deps /src/app/node_modules ./node_modules
ENV API_PORT=3001
CMD ["sh", "-c", "npm run seed && npm run dev"]

FROM node:24-alpine AS runtime
WORKDIR /src/app
COPY --from=install-deps /src/app/node_modules ./node_modules
COPY . ./
ENV API_PORT=3001
CMD ["sh", "-c", "npm run seed && npm start"]
