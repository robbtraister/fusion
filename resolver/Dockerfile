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

ARG LAMBDA

WORKDIR /workdir/resolver

COPY ./package*.json ./
RUN npm install
COPY ./ ./

# This only existed to run webpack
# Since this Dockerfile is only used for local development
#   and the assets are volume mapped and hot-reloaded,
#   there is no point to pre-building
# RUN npm run build 2> /dev/null || true

ENTRYPOINT ["npm", "run"]
CMD ["start"]
