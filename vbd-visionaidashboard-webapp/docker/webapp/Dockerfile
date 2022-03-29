FROM node:16.14-alpine AS build
WORKDIR /var/www/html
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:latest
COPY docker/webapp/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /var/www/html/dist/fuse/ /var/www/html/dist
