let s:defaultRegister = @@

function! SaveRegister()
    let s:defaultRegister = @@
endfunction

function! RestoreRegister()
    let @@ = s:defaultRegister
endfunction
