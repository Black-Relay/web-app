FROM node:24-alpine AS install-deps
WORKDIR /src/app
COPY package*.json ./
RUN npm install

FROM install-deps AS seeder
WORKDIR /src/app
COPY seeds models db.js ./
CMD ["npm", "run", "seed"]

FROM node:24-alpine AS devenv
WORKDIR /src/app
COPY --from=install-deps /src/app/node_modules ./node_modules
ENV API_PORT=3001
CMD ["npm", "run", "dev"]

FROM node:24-alpine AS runtime
WORKDIR /src/app
COPY --from=install-deps /src/app/node_modules ./node_modules
COPY . ./
ENV API_PORT=3001
CMD ["npm", "start"]
