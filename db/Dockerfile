FROM postgres:11.1-alpine

RUN mkdir /app
WORKDIR /app

COPY ./ ./

RUN touch database.sql

RUN cat ./src/seed.sql >> ./database.sql

RUN cp ./database.sql ../docker-entrypoint-initdb.d/

EXPOSE 5432
