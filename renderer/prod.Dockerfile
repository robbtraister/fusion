# npm packages
FROM alpine AS packages

RUN apk update
RUN apk upgrade
RUN apk add nodejs-npm && npm install -g npm
RUN node -v
RUN npm -v

WORKDIR /workdir

COPY package*.json ./


# base for bundling with dev modules
FROM packages AS bundler

RUN npm install


# client rendering engine
FROM bundler AS client

COPY webpack.client.js webpack.config.js
COPY client ./client

RUN npm run build:prod


# production modules
FROM packages AS modules

RUN npm install --production


# production image
FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache \
            nodejs \
            && \
    node -v && \
    rm -rf /var/cache/apk/*

WORKDIR /workdir

COPY package.json ./

COPY --from=modules /workdir/node_modules ./node_modules
COPY --from=client /workdir/dist ./build
COPY server ./server

CMD \
    mkdir -p ./dist/client/ && \
    rm -rf ./dist/client/* && \
    cp -R ./build/client/* ./dist/client/ && \
    node server/cluster
