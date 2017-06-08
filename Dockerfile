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

WORKDIR /pb

COPY package-lock.json ./

RUN \
    npm install

COPY . ./

RUN \
    npm run build

ENV USER="pb"
RUN \
    addgroup -S ${USER} && \
    adduser -S ${USER} -G ${USER} -s "/bin/sh"

USER ${USER}

ENTRYPOINT ["npm", "run"]
CMD ["start"]
