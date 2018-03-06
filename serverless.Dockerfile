FROM alpine:3.6

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache --update \
            git \
            nodejs-npm \
            && \
    npm install -g npm serverless && \
    git --version && \
    npm -v && \
    node -v && \
    sls -v && \
    rm -rf /var/cache/apk/*

WORKDIR /workdir

ARG LAMBDA

COPY ./${LAMBDA}/package*.json ./
RUN \
    npm install && \
    npm install serverless-offline
COPY ./${LAMBDA}/ ./

ENTRYPOINT ["npm", "run"]
CMD ["start"]
