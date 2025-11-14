FROM node:24-alpine AS install-deps
WORKDIR /src/app
COPY package*.json ./
RUN npm install

FROM node:24-alpine AS devenv
WORKDIR /src/app
COPY --from=install-deps /src/app/node_modules ./node_modules
ENV API_PORT_URL=http://localhost
ENV API_PORT=3001
CMD ["npm", "run", "docker-dev"]

FROM node:24-alpine AS build
WORKDIR /src/app
COPY --from=install-deps /src/app/node_modules ./node_modules
COPY . ./
ARG VITE_API_URL=http://localhost:3001
ARG VITE_OSM_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_OSM_URL=${VITE_OSM_URL}
RUN npm run build

FROM nginx:1.29.2 AS runtime
COPY --from=build /src/app/dist /usr/share/nginx/html
EXPOSE 80


