FROM debian:stretch

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
    git \
    wget \
    gnupg \
    apt-transport-https

RUN wget -O - https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.asc.gpg
RUN mv microsoft.asc.gpg /etc/apt/trusted.gpg.d/
RUN wget https://packages.microsoft.com/config/debian/9/prod.list
RUN mv prod.list /etc/apt/sources.list.d/microsoft-prod.list

RUN apt-get update -y
RUN apt-get install -y dotnet-sdk-5.0 \
    aspnetcore-runtime-5.0

ENTRYPOINT [ "bash" ]
