FROM node:lts-alpine as build-stage
WORKDIR /app

ARG ENV_FILE=.env.development

COPY package*.json ./
RUN npm ci

COPY . .

COPY ${ENV_FILE} .env

RUN npm run build

FROM nginx:stable-alpine as deploy-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]