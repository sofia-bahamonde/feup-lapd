FROM node:8.12 AS builder
# Define working directory and copy source
WORKDIR /tmp
COPY . .
# Install dependencies

# run image
RUN npm install

FROM node:8.12


RUN mkdir /app
WORKDIR /app

COPY ./package*.json ./
RUN npm install
RUN npm install nodemon


COPY . ./

COPY --from=builder /tmp/ .

EXPOSE 8080
CMD ["npm","run","start"]
