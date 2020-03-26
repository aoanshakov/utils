nnoremap ;oo :call <SID>OpenExtJsClass()<cr>

function! s:OpenExtJsClass()
    call SaveRegister()
    let classname = <SID>YankInQuotes()
    let exploded = split(classname, '\.')
    let exploded[0] = g:appPath
    let path = join(exploded, '/').'.js'
    echo path
    call <SID>OpenFile(path)
    call RestoreRegister()
endfunction

function! s:YankInQuotes()
    let quote = <SID>SearchQuote()
    execute "normal!yi".quote
    return @@
endfunction

function! s:SearchQuote()
    call search('\("\)\|\('."'".'\)', 'c')
    execute "normal!vy"
    return @@
endfunction

function! s:OpenFile(path)
    execute "normal!:w\<cr>:e ".a:path."\<cr>"
endfunction
