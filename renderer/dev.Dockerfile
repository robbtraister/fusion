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

COPY webpack.config.js ./
COPY client ./client
RUN npm run build:dev

COPY . ./

CMD \
    if [ "$WATCH" == 'true' ]; then \
      npm run watch & \
    fi && \
    npm run start:dev
