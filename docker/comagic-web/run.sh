#!/bin/bash

echo -e "tzdata tzdata/Areas select Europe\ntzdata tzdata/Zones/Europe select Moscow" > /tmp/tz && \
    debconf-set-selections /tmp/tz && \
    rm /etc/localtime /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata

action="runclient"
export COMAGIC_ENV_USER=""

while [ -n "$1" ]
do
    if [ "$1" = "-a" ]
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

if [ ! -d /usr/local/src ]
then
    echo "Workspace directory is not exist"
    exit 1
fi

initialized=0

if [ ! -d "/usr/local/src/comagic_web" ]
then
    initialize
    build
    config
    initialized=1
fi

if [ "$action" = "
    initialize" ]
then
    if [ $initialized -eq 1 ]
    then
        exit 0
    fi

    initialize
elif [ "$action" = "runclient" ]
then
    runclient
elif [ "$action" = "build" ]
then
    build
elif [ "$action" = "config" ]
then
    config
elif [ "$action" = "bash" ]
then
    bash
fi
