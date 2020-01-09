#!/bin/bash

if [ ! -d /usr/local/src ]
then
    echo "/usr/local/src directory is not exist"
    exit 1
fi

export COMAGIC_ENV_USER=""
action=''
server=''

while [ -n "$1" ]
do
    if [ "$1" = "-u" ]
    then
        export COMAGIC_ENV_USER=$2
        shift
    elif [ "$1" = "-s" ]
    then
        server=$2
    else
        action=$1
    fi

    shift
done

export CALL_CENTER_SERVER_DOMAIN=$server
export CALL_CENTER_APP_DOMAIN=127.0.0.1

if [ ! -d "/usr/local/src/call_center_frontend" ]
then
    cd /usr/local/src
    git clone git@git.dev.uis.st:web/call_center_frontend.git
    cd call_center_frontend

    install-dependencies
    build

    if [ "$action" = "build" ]
    then
        action='exit'
    fi
fi

cd /usr/local/src/call_center_frontend

if [ -z "$action" ]
then
    bash
else
    if [ "$action" = "runserver" ]
    then
        runserver
        bash
    elif [ "$action" = "build" ]
    then
        build
    elif [ "$action" = 'exit' ]
    then
        exit 0
    else
        bash
    fi
fi
