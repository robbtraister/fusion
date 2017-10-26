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


# layouts
FROM packages AS layouts

COPY .babelrc .
COPY webpack.templates.js ./
COPY layouts ./layouts

RUN npm run build:dev:templates


# templates
FROM packages AS templates

COPY .babelrc .
COPY webpack.templates.js ./
COPY components ./components
COPY templates ./templates

RUN npm run build:dev:templates


# final image
FROM packages

COPY webpack*.js ./
COPY --from=layouts /workdir/dist/layouts ./build/layouts
COPY --from=templates /workdir/dist/templates ./build/templates

CMD \
    mkdir -p \
          ./dist/layouts/ \
          ./dist/templates/ \
          && \
    rm -rf ./dist/{layouts,templates}/* && \
    cp -R ./build/* ./dist/ && \
    if [ "$WATCH" == 'true' ]; then \
      npm run watch:templates; \
    fi
