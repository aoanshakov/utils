FROM debian:stretch

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
    curl \
    gnupg2 \
    ca-certificates \
    lsb-release \
    less

RUN echo "deb http://nginx.org/packages/debian `lsb_release -cs` nginx" \
    | tee /etc/apt/sources.list.d/nginx.list

RUN curl -fsSL https://nginx.org/keys/nginx_signing.key | apt-key add -
RUN apt-get update -y
RUN apt-get install nginx

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh

ENTRYPOINT bash
