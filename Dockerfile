FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --update --no-cache \
            nginx \
            nodejs-npm \
            && \
    rm -rf /var/cache/apk/* && \
    npm update -g npm && \
    node -v && \
    npm -v

WORKDIR /fusion

COPY package.json ./

RUN \
    npm install

COPY . ./

RUN \
    (cd test && npm install) && \
    npm run test && \
    rm -rf ./test && \
    npm run build && \
    npm cache clean --force

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
          && \
    ln -sf /dev/stdout ./proxy/logs/access.log && \
    ln -sf /dev/stdout ./proxy/logs/error.log && \
    chown -R ${USER}:${USER} \
          ./proxy

USER ${USER}

ENTRYPOINT ["npm", "run"]
CMD ["start"]
