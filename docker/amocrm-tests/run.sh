#!/bin/bash

if [ ! -d /usr/local/src ]
then
    echo "workspace directory not exists"
    exit 1
fi

user=""
action="server"
widget_type="uis"

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
        user=$2
        shift
    fi

    shift
done

initialize -u $user

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
    build -t $widget_type -u $user
elif [ "$action" = "initialize" ]
then
    exit 0
fi
