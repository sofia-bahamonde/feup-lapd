FROM node:8.12 AS builder

#RUN apt install curl python pkgconfig python-dev openssl-dev libffi-dev musl-dev make gcc g++

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

COPY . ./

COPY --from=builder /tmp/ .

EXPOSE 8080
CMD ["npm","start"]
