#!/bin/bash

if [ ! -d /usr/local/src ]
then
    echo "workspace directory not exists"
    exit 1
fi

if [ ! -d /usr/local/src/comagic_web ]
then
    echo "comagic_web directory not exists"
    exit 1
fi

user=""
action="server"

while [ -n "$1" ]
do
    if [ "$1" = "-u" ]
    then
        user="-u $2"
        shift
    elif [ "$1" = "-a" ]
    then
        action=$2
        shift
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
