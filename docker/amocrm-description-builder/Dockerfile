FROM debian:buster

RUN apt-get update -y
RUN apt-get install -y \
    python3 \
    python3-pip \
    wget

RUN python3 -m pip install css_html_js_minify pillow

ADD build-description /usr/local/src/build-description
ADD run.sh /run.sh

RUN cd /usr/local/src/ && \
    wget https://github.com/sass/dart-sass/releases/download/1.23.7/dart-sass-1.23.7-linux-x64.tar.gz -P . && \
    tar xfvz dart-sass-1.23.7-linux-x64.tar.gz

RUN ln -s /usr/local/src/dart-sass/sass /usr/local/bin/sass

ENTRYPOINT [ "/run.sh" ]
