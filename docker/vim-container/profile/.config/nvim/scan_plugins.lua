local scan_path = vim.fn.expand("~/.vim/plugins")
local plugins = vim.fn.globpath(scan_path, "*", 1, 1)

print("Paste this into your lazy.nvim plugin list:\n")
for _, path in ipairs(plugins) do
  local name = vim.fn.fnamemodify(path, ":t")
  local github_guess = string.format("{ \"%s/%s\" },", "UNKNOWN_AUTHOR", name)
  print(github_guess)
end
