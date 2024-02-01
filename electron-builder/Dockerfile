FROM ubuntu:latest

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
   git build-essential clang libdbus-1-dev libgtk-3-dev \
   libnotify-dev libasound2-dev libcap-dev \
   libcups2-dev libxtst-dev \
   libxss1 libnss3-dev gcc-multilib g++-multilib curl \
   gperf bison python3-dbusmock openjdk-8-jre

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh

ADD bash /usr/local/bin

ENTRYPOINT [ "/usr/local/bin/entrypoint" ]
