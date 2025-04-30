-- Add custom runtime paths
vim.opt.rtp:prepend(vim.fn.expand("~/.vim"))
vim.opt.rtp:append(vim.fn.expand("~/.vim/after"))
vim.opt.runtimepath:append("~/.vim/plugins/*")

-- Sync 'packpath' with the updated 'runtimepath'
vim.o.packpath = vim.o.rtp

-- Source external .vimrc
vim.cmd("source ~/.vimrc")
vim.g.snippetsEmu_key = '<C-j>'

-- require("config.lazy")
--
-- Basic LSP setup
vim.api.nvim_create_autocmd("FileType", {
  pattern = "typescript,typescriptreact",
  callback = function()
    vim.lsp.start({
      name = "tsserver",
      cmd = { "typescript-language-server", "--stdio" },
      root_dir = vim.fs.dirname(vim.fs.find({ "package.json" }, { upward = true })[1]),
    })
  end,
})
