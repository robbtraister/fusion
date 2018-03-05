FROM alpine:3.6 as npm

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache --update \
            git \
            nodejs-npm \
            && \
    npm install -g npm && \
    git --version && \
    npm -v && \
    node -v && \
    rm -rf /var/cache/apk/*



FROM npm as server

WORKDIR /workdir/server

COPY ./lambda-server/package*.json ./
RUN npm install
COPY ./lambda-server ./



FROM npm as lambda

WORKDIR /workdir/lambda
ARG LAMBDA

COPY ./${LAMBDA}/package*.json ./
RUN npm install

COPY ./${LAMBDA}/ ./
RUN npm run build 2> /dev/null || true



FROM npm

COPY --from=server /workdir/server /workdir/server
COPY --from=lambda /workdir/lambda /workdir/lambda

WORKDIR /workdir/lambda

ENTRYPOINT ["npm", "run"]
CMD ["start"]
