#!/bin/bash

source_file_name=''
target_file_name=''
mode=''

while [ -n "$1" ]
do
    if [ "$1" = "-s" ]
    then
        source_file_name=$2
        shift
    elif [ "$1" = "-t" ]
    then
        target_file_name=$2
        shift
    elif [ "$1" = "-m" ]
    then
        mode=$2
        shift
    fi

    shift
done

if [ $mode = 'html' ]
then
    python3 /usr/local/src/build-description $mode \
        /usr/local/src/amocrm-descriptions/$source_file_name.html \
        /usr/local/src/amocrm_widget/i18n/$target_file_name.json
elif [ $mode = 'scss' ]
then
    python3 /usr/local/src/build-description $mode \
        /usr/local/src/amocrm-descriptions/$source_file_name.scss \
        /usr/local/src/amocrm_widget/$target_file_name.scss \
        /usr/local/src/amocrm_widget/images
fi
