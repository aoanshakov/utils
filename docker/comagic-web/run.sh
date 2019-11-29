#!/bin/bash

if [ ! -d $HOME ]
then
    echo "$HOME directory is not exist"
    exit 1
fi

if [ ! -d "$HOME/comagic_web" ]
then
    initialize
    build
    configurate
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
    elif [ "$1" = "configurate" ]
    then
        configurate
    else
        bash
    fi
fi
