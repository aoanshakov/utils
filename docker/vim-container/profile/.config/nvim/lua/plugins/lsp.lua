return {
  {
    "neovim/nvim-lspconfig",
    config = function()
      local lspconfig = require("lspconfig")

      -- Setup tsserver
      lspconfig.tsserver.setup({
        on_attach = function(client, bufnr)
          -- optional keybindings
        end,
      })

      lspconfig.rust_analyzer.setup({})

    end,
  },
}
