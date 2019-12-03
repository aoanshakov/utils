FROM debian:buster

RUN apt-get update -y
RUN apt-get install -y \
    git \
    curl \
    apache2

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh

ADD scripts/* /usr/bin/
ADD run.sh /run.sh

ENTRYPOINT [ "/run.sh" ]
