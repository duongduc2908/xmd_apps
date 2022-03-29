FROM mysql:8.0.28

RUN mkdir /data
COPY ./docker/mysql/init_db.sh /docker-entrypoint-initdb.d/

RUN which bash

RUN chmod +x /docker-entrypoint-initdb.d/init_db.sh
