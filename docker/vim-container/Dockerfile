FROM debian:bookworm

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
    vim \
    locales \
    curl \
    git \
    flake8 \
    tidy \
    rsync \
    zip \
    wget

RUN sed -i -e 's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="ru_RU.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=ru_RU.UTF-8

ENV LANG ru_RU.UTF-8

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

RUN wget https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz -P /tmp && \
    tar -xvzf /tmp/nvim-linux-x86_64.tar.gz -C /opt && \
    rm /tmp/nvim-linux-x86_64.tar.gz

RUN ln -s /opt/nvim-linux-x86_64/bin/nvim /usr/local/bin/nvim
RUN nvim --version

RUN npm set registry http://npm.dev.uis.st:80
RUN npm install -g typescript typescript-language-server
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN /bin/bash -c "source ~/.bashrc && nvm && nvm install 14 && nvm install 18"

ENTRYPOINT [ "bash" ]
