#!/bin/bash

if [ ! -d /usr/local/src ]
then
    echo "/usr/local/src directory is not exist"
    exit 1
fi

export COMAGIC_ENV_USER=""
action=''
server='https://va.uiscom.ru'

while [ -n "$1" ]
do
    if [ "$1" = "--server" ]
    then
        server=$2
        shift
    elif [ "$1" = "-u" ]
    then
        export COMAGIC_ENV_USER=$2
        shift
    else
        action=$1
    fi

    shift
done

initialize

cd /usr/local/src/utils/amocrm-proxy

if [ -z "$action" ]
then
    server $server
else
    if [ "$action" = "server" ]
    then
        server $server
    elif [ "$action" = "initialize" ]
    then
        exit 0
    elif [ "$action" = "bash" ]
    then
        bash
    else
        server
    fi
fi
