FROM alpine AS dist

RUN \
    apk update && \
    apk upgrade && \
    apk add --update --no-cache \
            nodejs-npm \
            && \
    rm -rf /var/cache/apk/* && \
    npm install -g npm && \
    node -v && \
    npm -v

WORKDIR /fusion

COPY package.json ./

RUN \
    npm install

COPY .babelrc webpack.config.js style.scss ./
COPY test ./test
COPY components ./components
COPY templates ./templates
COPY src ./src

COPY consumer ./node_modules/consumer

RUN \
    npm run test && \
    npm run build

FROM alpine AS modules

RUN \
    apk update && \
    apk upgrade && \
    apk add --update --no-cache \
            nodejs-npm \
            && \
    rm -rf /var/cache/apk/* && \
    npm install -g npm && \
    node -v && \
    npm -v

WORKDIR /fusion

COPY package.json ./

RUN \
    npm install --production

COPY consumer ./node_modules/consumer

FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --update --no-cache \
            nginx \
            nodejs \
            && \
    rm -rf /var/cache/apk/* && \
    nginx -v && \
    node -v

WORKDIR /fusion

COPY . ./
COPY --from=dist /fusion/dist/ ./dist/
COPY --from=modules /fusion/node_modules ./node_modules/

ENV USER="fusion"
RUN \
    addgroup -S ${USER} && \
    adduser -S ${USER} -G ${USER} -s "/bin/sh" && \
    mkdir -p \
          ./proxy/logs \
          ./proxy/tmp/cache \
          ./proxy/tmp/client_body \
          ./proxy/tmp/fastcgi \
          ./proxy/tmp/proxy \
          ./proxy/tmp/scgi \
          ./proxy/tmp/uwsgi \
          ./renderings \
          && \
    ln -sf /dev/stdout ./proxy/logs/access.log && \
    ln -sf /dev/stdout ./proxy/logs/error.log && \
    chown -R ${USER}:${USER} \
          ./proxy \
          ./renderings

USER ${USER}

CMD node src/server/cluster & ./proxy/run.sh
