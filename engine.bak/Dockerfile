FROM alpine:3.8

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache --update \
            git \
            nodejs-npm \
            && \
    npm install -g npm serverless && \
    rm -rf /var/cache/apk/* && \
    git --version && \
    npm -v && \
    node -v && \
    sls -v

WORKDIR /workdir/engine

COPY ./package*.json ./
RUN npm install
COPY . ./

ENTRYPOINT ["npm", "run"]
CMD ["start"]
