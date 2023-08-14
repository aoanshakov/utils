FROM debian:buster

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
    curl \
    gnupg2 \
    ca-certificates \
    lsb-release \
    git \
    gcc \
    g++ \
    make

RUN echo "deb http://nginx.org/packages/debian `lsb_release -cs` nginx" \
    | tee /etc/apt/sources.list.d/nginx.list

RUN curl -fsSL https://nginx.org/keys/nginx_signing.key | apt-key add -
RUN apt-get update -y
RUN apt-get install nginx

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN /bin/bash -c "source ~/.bashrc && nvm install 18 && nvm use 18"

ADD bash /usr/local/bin
ADD nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "/usr/local/bin/entrypoint" ]
