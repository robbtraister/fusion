FROM alpine:3.6

RUN \
    apk update && \
    apk upgrade && \
    # used for mongodb-tools
    apk add --update --no-cache \
            openssl \
            pcre \
            zlib \
            && \
    rm -rf /var/cache/apk/* && \
    openssl version

ARG NGINX_VERSION=1.12.2
ENV USER=nginx
WORKDIR /etc/nginx

# build nginx with let and statsd module
RUN \
    DEV_PACKAGES='g++ git make openssl-dev pcre-dev wget zlib-dev' && \
    # add dev packages
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
       /etc/nginx/src \
       /etc/nginx/objs/src \
       /etc/nginx/modules/* \
       && \
    nginx -v && \
    # remove dev packages
    apk del ${DEV_PACKAGES} && \
    rm -rf /var/cache/apk/* && \
    addgroup ${USER} 2> /dev/null && \
    adduser -S ${USER} -G ${USER} -s /bin/sh 2> /dev/null && \
    chown -R ${USER}:${USER} ./

RUN \
    mkdir -p \
          ./logs \
          && \
    ln -sf /dev/stdout ./logs/access.log && \
    ln -sf /dev/stderr ./logs/error.log

COPY ./src ./src

#VOLUME /etc/nginx/tmp

# Use nginx user
RUN chown -R ${USER}:${USER} ./src

# USER ${USER}

# Launch init to configure PB and start supervisord on startup
CMD ./src/run.sh
