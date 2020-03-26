nnoremap ;g :set operatorfunc=<SID>GrepOperator<cr>g@
vnoremap ;g :<c-u>call <SID>GrepOperator(visualmode())<cr>

function! s:GrepOperator(type)
    let clipboard = @@
    if a:type ==# 'v'
        normal!`<v`>y
    elseif a:type ==# 'char'
        normal!`[v`]y
    else
        return
    endif
    execute "grep! --exclude-dir=\".venv\" --exclude-dir=\".webassets-cache\" --exclude-dir=\"css\" --exclude-dir=\"gen\" --exclude-dir=\"tmp\" --exclude-dir=\"\\.git\" --exclude=\"ext-all-rtl-debug.js\" --exclude-dir=\"node_modules\" --exclude-dir=\"assets\" --exclude-dir=\"ext\" --exclude-dir=\"runtime\" --exclude=\"api3.wsdl\" --exclude=\"bootstrap.json\" --exclude=*.{swp,log,gif,png,pyc} --exclude-dir=\"build\" --exclude-dir=\"\\.sass-cache\" --exclude=*.log.* --exclude=package-lock.json --exclude=yarn.lock --exclude-dir=\"\\.svn\" --exclude-dir=docs -R ".shellescape(@@)." ."
    copen
    let @@ = clipboard
endfunction
