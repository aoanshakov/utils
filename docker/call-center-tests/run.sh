#!/bin/bash

if [ ! -d /usr/local/src ]
then
    echo "workspace directory not exists"
    exit 1
fi

function checkDirectoryExistence {
    if [ ! -d /usr/local/src/$1 ]
    then
        echo "$1 directory not exists"
        exit 1
    fi
}

checkDirectoryExistence 'call_center_frontend'
checkDirectoryExistence 'amocrm-widget'

export COMAGIC_ENV_USER=""
action="server"

while [ -n "$1" ]
do
    if [ "$1" = "-u" ]
    then
        export COMAGIC_ENV_USER=$2
        shift
    elif [ "$1" = "-a" ]
    then
        action=$2
        shift
    elif [ "$1" = "--no-cache" ]
    then
        noCache="--no-cache"
    fi

    shift
done

initialize $user

if [ $action = "initialize" ]
then
    exit 0
elif [ $action = "server" ]
then
    server
    bash
elif [ $action = "bash" ]
then
    bash
fi
