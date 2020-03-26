#!/bin/bash

cp -r /environment/.vim /environment/.vimrc /environment/eslint $HOME/
vim -c "silent!PlugInstall" -c "qa"
vim -c "silent!source /environment/snippy_bundles.vba" -c "qa"
vim -c "silent!source /environment/snippy_plugin.vba" -c "qa"
cp -r /environment/.vim/after/ftplugin/* $HOME/.vim/after/ftplugin/
cp /environment/.gitconfig $HOME/

if [ -d /target ]
then
    if [ -z "$(ls -A /target )" ]
    then
        if [ -z "$1" ]
        then
            echo "Please specify user name"
            exit 1
        fi

        cp -r $HOME/.vim /environment/.vimrc /environment/eslint /target/
        chown -R $1:$1 /target/.vim /target/.vimrc /target/eslint
    else
        echo "Target directory should be empty"
        exit 1
    fi
else
    bash
fi
