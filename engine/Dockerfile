FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache \
            nodejs-npm \
            && \
    npm install -g npm serverless && \
    rm -rf /var/cache/apk/* && \
    node -v && \
    npm -v && \
    sls -v

WORKDIR /workdir/engine

COPY ./package*.json ./

ARG BUILD_ENV=development
RUN \
    if [ "${BUILD_ENV}" == 'production' ]; \
    then \
      npm install --production; \
    else \
      npm install; \
    fi

COPY . ./

ENTRYPOINT ["npm", "run"]
CMD ["start"]

# install one level up so it's baked into the docker cache
ONBUILD COPY ./package*.json /workdir
ONBUILD RUN cd /workdir && npm install --production --unsafe-perm
