# npm packages
FROM alpine AS bundler

RUN apk update
RUN apk upgrade
RUN apk add nodejs-npm && npm install -g npm
RUN node -v
RUN npm -v

WORKDIR /workdir

COPY package*.json ./
RUN npm install


# layouts
FROM bundler AS layouts

COPY webpack.templates.js webpack.config.js
COPY layouts ./layouts

RUN npm run build:prod


# templates
FROM bundler AS templates

COPY webpack.templates.js webpack.config.js
COPY components ./components
COPY templates ./templates

RUN npm run build:prod


# production image
FROM alpine

WORKDIR /workdir

COPY resources ./static/resources
COPY resolvers ./build/resolvers
COPY --from=layouts /workdir/dist/layouts ./build/layouts
COPY --from=templates /workdir/dist/templates ./build/templates

CMD \
    mkdir -p \
          ./dist/layouts/ \
          ./dist/resolvers/ \
          ./dist/templates/ \
          && \
    rm -rf \
       ./dist/{layouts,resolvers,templates}/* \
       ./resources/* \
       && \
    cp -R ./build/* ./dist/ && \
    cp -R ./static/resources/* ./resources/
