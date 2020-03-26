nnoremap ;sl :call<SID>NXSelect()<cr>
vnoremap ;sl :call<SID>VXSelect()<cr>

function! s:VXSelect()
    call SaveRegister()
    execute "normal!`<v`>y"
    execute "normal!:w \<cr>"
    execute "normal!:e /tmp/toxsel\<cr>"
    execute "normal!ggVGp"
    execute "normal!:w \<cr>"
    execute "normal!:!xsel -bi < /tmp/toxsel\<cr>"
    execute "normal!:BW\<cr>"
    call RestoreRegister()
endfunction

function! s:NXSelect()
    call SaveRegister()
    execute "normal!ggVGy"
    execute "normal!:w \<cr>"
    execute "normal!:e /tmp/toxsel\<cr>"
    execute "normal!ggVGp"
    execute "normal!:w \<cr>"
    execute "normal!:!xsel -bi < /tmp/toxsel\<cr>"
    execute "normal!:BW\<cr>"
    call RestoreRegister()
endfunction

