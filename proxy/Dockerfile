# production image
FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache \
            nginx \
            && \
    nginx -v && \
    rm -rf /var/cache/apk/*

WORKDIR /proxy

RUN mkdir -p \
          ./logs \
          ./tmp/cache \
          ./tmp/client_body \
          ./tmp/fastcgi \
          ./tmp/proxy \
          ./tmp/scgi \
          ./tmp/uwsgi \
          && \
    ln -sf /dev/stdout ./logs/access.log && \
    ln -sf /dev/stderr ./logs/error.log

COPY . ./

CMD rm -rf ./tmp/cache/* && \
    ./run.sh
