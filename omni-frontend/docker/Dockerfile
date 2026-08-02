FROM debian:bullseye

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
    openssl \
    gnupg2 \
    ca-certificates \
    lsb-release \
    git \
    curl \
    postgresql

RUN echo "deb http://nginx.org/packages/debian `lsb_release -cs` nginx" \
    | tee /etc/apt/sources.list.d/nginx.list

RUN curl -fsSL https://nginx.org/keys/nginx_signing.key | apt-key add -
RUN apt-get update -y
RUN apt-get install -y nginx

ADD bash /usr/local/bin
ADD nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "/usr/local/bin/entrypoint" ]
