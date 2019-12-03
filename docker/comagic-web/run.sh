#!/bin/bash

if [ ! -d /usr/local/src ]
then
    echo "Workspace directory is not exist"
    exit 1
fi

if [ ! -d "/usr/local/src/comagic_web" ]
then
    initialize
    build
    configure
fi

if [ -z "$1" ]
then
    bash
else
    if [ "$1" = "runclient" ]
    then
        runclient
    elif [ "$1" = "build" ]
    then
        build
    elif [ "$1" = "configure" ]
    then
        configure
    else
        bash
    fi
fi
