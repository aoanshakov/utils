FROM debian:buster

RUN apt-get update -y
RUN apt-get install -y \
    python3 \
    python3-dev \
    python-pip \
    postgresql \
    postgresql-server-dev-11 \
    mercurial \
    git \
    curl \
    sudo \
    libmagickwand-dev \
    python3-venv

RUN pip install virtualenv

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh
RUN npm install -g gulp
RUN python3 -m venv /home/venv
RUN /home/venv/bin/pip3 install black astor

ADD pip.conf /home/pip.conf
ADD configurate /home/configurate
ADD scripts/* /usr/bin/

ADD run.sh /run.sh
ENTRYPOINT [ "/run.sh" ]
