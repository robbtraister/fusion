FROM alpine:3.7

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

# add file we know exists and won't cause an issue in case no package.json exists
ONBUILD COPY docker-compose.yml ./src/package*.json ./bundle
ONBUILD RUN if [ -f ./bundle/package.json ]; then (cd ./bundle && npm install --production); fi
