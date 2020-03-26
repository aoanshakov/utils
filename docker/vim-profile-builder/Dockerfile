FROM debian:buster

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y \
    vim \
    locales \
    git \
    wget \
    curl \
    flake8 \
    tidy

RUN sed -i -e 's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="ru_RU.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=ru_RU.UTF-8

ENV LANG ru_RU.UTF-8

ADD environment /environment

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs
RUN curl -L https://npmjs.org/install.sh | sh

RUN mkdir -p /environment/.vim/pack/flake8/start/ && \
    cd /environment/.vim/pack/flake8/start/ && \
    git clone https://github.com/nvie/vim-flake8.git

RUN cd /environment && \
    git clone https://github.com/fholgado/minibufexpl.vim.git && \
    cp minibufexpl.vim/plugin/minibufexpl.vim .vim/plugin

RUN cd /environment && \
    git clone https://github.com/qpkorr/vim-bufkill.git && \
    cp vim-bufkill/plugin/bufkill.vim .vim/plugin

RUN cd /environment && \
    git clone https://github.com/tpope/vim-surround.git && \
    cp vim-surround/plugin/surround.vim .vim/plugin

RUN cd /environment/eslint/call_center_frontend && \
    npm install eslint eslint-plugin-react babel-eslint

RUN cd /environment/eslint/comagic_web && \
    npm install eslint

RUN mkdir /environment/.vim/autoload
RUN wget https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim -O /environment/.vim/autoload/plug.vim
RUN wget https://www.vim.org/scripts/download_script.php?src_id=8450 -O /environment/snippy_plugin.vba
RUN wget https://www.vim.org/scripts/download_script.php?src_id=8443 -O /environment/snippy_bundles.vba

ADD run.sh run.sh
ENTRYPOINT [ "/run.sh" ]
