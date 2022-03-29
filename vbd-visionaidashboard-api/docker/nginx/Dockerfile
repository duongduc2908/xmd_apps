FROM nginx:latest

RUN mkdir /nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
WORKDIR /nginx
