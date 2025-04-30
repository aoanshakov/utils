return {
  'nvim-treesitter/nvim-treesitter',
  build = ':TSUpdate',
  event = { 'BufReadPost', 'BufNewFile' },
  config = function()
    require('nvim-treesitter.configs').setup({
      ensure_installed = {
        'lua', 'python', 'javascript', 'typescript', 'tsx', 'html', 'css',
        -- add more languages as needed
      },
      highlight = {
        enable = true,
        additional_vim_regex_highlighting = false,
      },
      indent = { enable = true },
      -- other modules like incremental_selection or textobjects can be added here
    })
  end,
}
