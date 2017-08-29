# npm packages
FROM alpine AS packages

RUN apk update
RUN apk upgrade
RUN apk add nodejs-npm && npm install -g npm
RUN node -v
RUN npm -v

WORKDIR /workdir

COPY package*.json ./
RUN npm install

COPY . ./

RUN \
    npm run build:dev:client && \
    npm run build:dev:templates

CMD \
    npm run watch:client & \
    npm run watch:templates & \
    npm run start:dev
