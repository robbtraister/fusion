FROM alpine:3.6

RUN \
    apk update && \
    apk upgrade && \
    # used for mongodb-tools
    apk add --update --no-cache \
            git \
            nodejs-npm \
            openssl \
            pcre \
            zlib \
            && \
    rm -rf /var/cache/apk/* && \
    npm install -g npm serverless && \
    git --version && \
    npm -v && \
    node -v && \
    openssl version && \
    sls -v

ARG NGINX_VERSION=1.12.2
ENV USER=nginx
WORKDIR /etc/nginx

# build nginx with let and statsd module
RUN \
    addgroup ${USER} 2> /dev/null && \
    adduser -S ${USER} -G ${USER} -s /bin/sh 2> /dev/null && \
    # add dev packages
    DEV_PACKAGES='g++ make openssl-dev pcre-dev wget zlib-dev' && \
    apk add --update --no-cache ${DEV_PACKAGES} && \
    # download nginx src
    wget --no-check-certificate -O nginx.tar.gz https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar zxvf nginx.tar.gz --strip-components 1 && \
    rm nginx.tar.gz && \
    # download nginx let module
    git clone --branch=master --single-branch --depth=1 https://github.com/arut/nginx-let-module ./modules/nginx-let && \
    rm -rf ./modules/nginx-let/.git && \
    # download nginx statsd module
    git clone --branch=tags-12 --single-branch --depth=1 https://github.com/robbtraister/nginx-statsd ./modules/nginx-statsd && \
    rm -rf ./modules/nginx-statsd/.git && \
    # build nginx
    ./configure \
                --user=${USER} \
                --group=${USER} \
                --with-http_realip_module \
                --add-module=modules/nginx-let \
                --add-module=modules/nginx-statsd \
                && \
    make -j2 && \
    make install && \
    ln -sf `pwd`/objs/nginx /usr/bin/nginx && \
    rm -rf \
       /etc/nginx/CHANGES* \
       /etc/nginx/auto \
       /etc/nginx/modules \
       /etc/nginx/objs/src \
       /etc/nginx/src \
       && \
    nginx -v && \
    # remove dev packages
    apk del ${DEV_PACKAGES} && \
    rm -rf /var/cache/apk/* && \
    chown -R ${USER}:${USER} ./

RUN \
    mkdir -p \
          ./logs \
          ./tmp \
          /workdir/engine \
          /workdir/resolver \
          && \
    ln -sf /dev/stdout ./logs/access.log && \
    ln -sf /dev/stderr ./logs/error.log && \
    chown -R ${USER}:${USER} \
          ./logs \
          ./tmp \
          /workdir/engine \
          /workdir/resolver

COPY ./proxy/package*.json ./
RUN npm install


WORKDIR /workdir/engine
COPY ./engine/package*.json ./
RUN npm install


WORKDIR /workdir/resolver
COPY ./resolver/package*.json ./
RUN npm install


WORKDIR /etc/nginx
COPY ./proxy/src ./src/
RUN chown -R ${USER}:${USER} ./src

COPY ./engine/ /workdir/engine/
COPY ./resolver/ /workdir/resolver/


# Use nginx user
USER ${USER}

# Launch init to configure PB and start supervisord on startup
CMD \
    ( \
      cd /workdir/engine/ && \
      PORT=${ENGINE_PORT:-8082} npm run start \
    ) & \
    ( \
      cd /workdir/resolver/ && \
      PORT=${RESOLVER_PORT:-8083} npm run start \
    ) & \
    ./src/run.sh
