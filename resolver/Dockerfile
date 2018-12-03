FROM alpine:3.8

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache --update \
            nodejs-npm \
            && \
    npm install -g npm serverless && \
    rm -rf /var/cache/apk/* && \
    node -v && \
    npm -v && \
    sls -v

WORKDIR /workdir/resolver

COPY ./package*.json ./
RUN npm install
COPY . ./

ENTRYPOINT ["npm", "run"]
CMD ["start"]
