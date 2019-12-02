FROM debian:buster

RUN apt-get update -y
RUN apt-get install -y \
    apache2 \
    curl \
    git \
    unzip

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh
RUN npm install -g grunt-cli

ADD run.sh /run.sh
ADD scripts /usr/local/bin

ENTRYPOINT [ "/run.sh" ]
