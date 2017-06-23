FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --update --no-cache \
            nodejs-npm \
            && \
    rm -rf /var/cache/apk/* && \
    npm update -g npm && \
    node -v && \
    npm -v

WORKDIR /fusion-components

COPY package.json ./

RUN \
    npm install

COPY . ./

RUN \
    npm run build

VOLUME ./export

CMD cp -R ./dist/* ./export
