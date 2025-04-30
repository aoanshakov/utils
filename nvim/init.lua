-- Add custom runtime paths
vim.opt.rtp:prepend(vim.fn.expand("~/utils/docker/vim-container/profile/.vim"))
vim.opt.rtp:append(vim.fn.expand("~/utils/docker/vim-container/profile/.vim/after"))

-- Sync 'packpath' with the updated 'runtimepath'
vim.o.packpath = vim.o.rtp

-- Source external .vimrc
vim.cmd("source ~/utils/docker/vim-container/profile/.vimrc")

vim.cmd("source ~/utils/docker/vim-container/profile/.vimrc")
vim.cmd("source ~/.vim/plugin/bufkill.vim")
vim.cmd("source ~/.vim/plugin/GrepOperator.vim")
vim.cmd("source ~/.vim/plugin/minibufexpl.vim")
vim.cmd("source ~/.vim/plugin/OpenExtJsClass.vim")
vim.cmd("source ~/.vim/plugin/SaveRegister.vim")
vim.cmd("source ~/.vim/plugin/snippetsEmu.vim")
vim.cmd("source ~/.vim/plugin/surround.vim")
vim.cmd("source ~/.vim/plugin/XSelect.vim")

require("config.lazy")
