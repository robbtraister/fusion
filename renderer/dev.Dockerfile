# npm packages
FROM alpine AS packages

RUN apk update
RUN apk upgrade
RUN apk add nodejs-npm && npm install -g npm
RUN node -v
RUN npm -v

WORKDIR /renderer

COPY package*.json ./
RUN npm install

COPY .babelrc webpack.*.js ./

COPY client ./client
RUN npm run build:dev:client

COPY components ./components
COPY layouts ./layouts
COPY templates ./templates
RUN npm run build:dev:templates

COPY . ./

CMD \
    npm run watch:client & \
    npm run watch:templates & \
    npm run start:dev
