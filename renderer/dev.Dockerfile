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


# client bundle
FROM packages as client

COPY webpack.client.js ./
COPY client ./client

RUN npm run build:dev:client


# final image
FROM packages

COPY webpack*.js ./
COPY --from=client /workdir/dist ./build

RUN ls /workdir/build

CMD \
    mkdir -p ./dist/client/ && \
    rm -rf ./dist/client/* && \
    cp -R ./build/client/* ./dist/client/ && \
    if [ "$WATCH" == 'true' ]; then \
      npm run watch:client & \
    fi && \
    npm run start:dev
