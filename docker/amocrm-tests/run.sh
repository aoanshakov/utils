#!/bin/bash

if [ ! -d /usr/local/src ]
then
    echo "workspace directory not exists"
    exit 1
fi

action="server"
widget_type="uis"
export COMAGIC_ENV_USER=""

while [ -n "$1" ]
do
    if [ "$1" = "-t" ]
    then
        widget_type=$2
        shift
    elif [ "$1" = "-a" ]
    then
        action=$2
        shift
    elif [ "$1" = "-u" ]
    then
        export COMAGIC_ENV_USER=$2
        shift
    fi

    shift
done

initialize

if [ "$action" = "server" ]
then
    build -t $widget_type
    server
    bash
elif [ "$action" = "bash" ]
then
    bash
elif [ "$action" = "build" ]
then
    build -t $widget_type
elif [ "$action" = "initialize" ]
then
    exit 0
fi
