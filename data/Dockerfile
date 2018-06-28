FROM mongo:3.4

RUN apt-get update && \
    apt-get install -y \
                    netcat

WORKDIR /data
COPY *.sh ./

VOLUME /data/restore

CMD ["./run.sh"]
