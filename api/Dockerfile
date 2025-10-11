FROM node:24-alpine AS dev
WORKDIR /src/app
COPY . /src/app/
RUN npm install
ENV API_PORT=3001
CMD ["npm", "run", "dev"]
