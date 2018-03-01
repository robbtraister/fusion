FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --update --no-cache \
            nginx \
            && \
    rm -rf /var/cache/apk/* && \
    nginx -v

WORKDIR /etc/nginx

RUN \
    mkdir -p \
          ./conf.d \
          ./logs \
          && \
    ln -sf /dev/stdout ./logs/access.log && \
    ln -sf /dev/stderr ./logs/error.log

COPY . ./

ENV USER=nginx
RUN chown -R ${USER}:${USER} ./
USER ${USER}

CMD ./run.sh
