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

COPY .babelrc ./


# layouts
FROM bundler AS layouts

COPY webpack.config.js ./
COPY layouts ./layouts

RUN npm run build:prod


# templates
FROM bundler AS templates

COPY webpack.config.js ./
COPY components ./components
COPY templates ./templates

RUN npm run build:prod


# production image
FROM alpine

WORKDIR /assets

COPY --from=layouts /workdir/dist/layouts ./dist/layouts
COPY --from=templates /workdir/dist/templates ./dist/templates

CMD \
    if [ "$WATCH" == 'true' ]; then \
      npm run watch & \
    fi
