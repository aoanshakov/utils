FROM debian:buster

RUN apt-get update -y
RUN apt-get install -y \
    openssl \
    gnupg2 \
    ca-certificates \
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

RUN curl -fsSL https://nginx.org/keys/nginx_signing.key | apt-key add -
RUN apt-get update -y
RUN apt-get install nginx -y

RUN pip install virtualenv

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh
RUN npm install -g gulp
RUN python3 -m venv /home/venv
RUN /home/venv/bin/pip3 install black astor

ADD requirements.txt.diff /home/requirements.txt.diff
ADD pip.conf /home/pip.conf
ADD configure /home/configure
ADD scripts/* /usr/local/bin/

ADD run.sh /run.sh
ADD nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT [ "/run.sh" ]
