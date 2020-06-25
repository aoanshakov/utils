FROM debian:buster

RUN apt-get update -y
RUN apt-get install -y \
    curl

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh

ENTRYPOINT bash
