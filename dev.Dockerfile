# npm packages
FROM alpine AS packages

RUN apk update
RUN apk upgrade
RUN apk add nginx
RUN nginx -v
RUN apk add nodejs-npm && npm install -g npm
RUN node -v
RUN npm -v

WORKDIR /workdir

COPY package*.json ./
RUN npm install

COPY .babelrc webpack.*.js ./

COPY client ./client
RUN npm run build:dev:client

COPY components ./components
COPY layouts ./layouts
COPY templates ./templates
RUN npm run build:dev:templates

COPY . ./

RUN mkdir -p \
          ./proxy/cache \
          ./proxy/logs \
          ./proxy/tmp/client_body \
          ./proxy/tmp/fastcgi \
          ./proxy/tmp/proxy \
          ./proxy/tmp/scgi \
          ./proxy/tmp/uwsgi \
          && \
    ln -sf /dev/stdout ./proxy/logs/access.log && \
    ln -sf /dev/stderr ./proxy/logs/error.log

CMD \
    rm -rf ./proxy/cache/* && \
    npm run watch:client & \
    npm run watch:templates & \
    PORT=8081 npm run start:dev & \
    nginx -p ./proxy -c ./nginx.conf
