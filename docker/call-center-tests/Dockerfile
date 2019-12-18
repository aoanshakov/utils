FROM debian:stretch

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
    apache2 \
    git \
    curl \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh

ADD scripts /usr/local/bin
ADD run.sh /run.sh

ENTRYPOINT [ "/run.sh" ]
