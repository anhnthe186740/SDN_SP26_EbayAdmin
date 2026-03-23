# syntax=docker/dockerfile:1.4

FROM node:hydrogen-slim AS node

WORKDIR /app

COPY . /app/

RUN ["npm", "ci"]

RUN ["npm", "run", "build"]

FROM nginx:1.13-alpine

COPY --from=node /app/build/ /var/www/dist/

COPY --from=node /app/nginx.conf /etc/nginx/nginx.conf