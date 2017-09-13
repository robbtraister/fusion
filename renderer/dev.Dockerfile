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

COPY .babelrc ./


# client bundle
FROM packages as client

COPY webpack.client.js ./
COPY client ./client

RUN npm run build:dev:client


# layouts
FROM packages AS layouts

COPY webpack.templates.js ./
COPY layouts ./layouts

RUN npm run build:dev:templates


# templates
FROM packages AS templates

COPY webpack.templates.js ./
COPY components ./components
COPY templates ./templates

RUN npm run build:dev:templates


# final image
FROM packages

COPY webpack*.js ./
COPY --from=client /renderer/dist ./dist
COPY --from=layouts /renderer/dist/layouts ./dist/layouts
COPY --from=templates /renderer/dist/templates ./dist/templates
COPY resources ./resources
COPY server ./server

CMD \
    if [ "$WATCH" == 'true' ]; then \
      npm run watch:client & \
      npm run watch:templates & \
    fi && \
    npm run start:dev
