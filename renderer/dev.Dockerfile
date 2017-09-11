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

COPY webpack.client.js ./
COPY client ./client
RUN npm run build:dev:client

COPY webpack.templates.js ./
COPY components ./components
COPY layouts ./layouts
COPY templates ./templates
RUN npm run build:dev:templates

COPY . ./

CMD \
    if [ "$WATCH" == 'true' ]; then \
      npm run watch:client & \
      npm run watch:templates & \
    fi && \
    npm run start:dev
