FROM debian:buster

RUN apt-get update -y
RUN apt-get install -y \
    git \
    python3 \
    python3-venv

ADD scripts/* /usr/bin/
ADD run.sh /run.sh

ENTRYPOINT [ "/run.sh" ]
