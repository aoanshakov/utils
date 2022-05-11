call plug#begin()
Plug 'leafgarland/typescript-vim'
Plug 'peitalin/vim-jsx-typescript'
Plug 'scrooloose/nerdtree'
Plug 'michaeljsmith/vim-indent-object'
Plug 'vim-syntastic/syntastic'
call plug#end()

let g:syntastic_ignore_files = ['libs/extjs512/build/ext-all-debug.js', 'node_modules/jssip']
let g:syntastic_javascript_checkers=['eslint']
let g:syntastic_typescript_checkers=['eslint']
let g:syntastic_html_checkers = ['tidy']
let g:syntastic_check_on_open = 0
let g:syntastic_check_on_wq = 0
let g:syntastic_mode_map = {'mode':'passive'}
let g:appName = ''
let g:appPath = ''
let g:isReactApp = 0

au VimEnter * call OpenNerdTree()
nnoremap <c-n> :NERDTreeFind<cr>

colorscheme desert

set nofixendofline
set hidden
set confirm
set smartindent
set number
set nowrap

set incsearch
set nohlsearch

set tabstop=4
set shiftwidth=4
set expandtab
set list
set listchars=tab:..

syntax on
set synmaxcol=200

nnoremap - ;
nnoremap ;bb ggO#!/bin/bash<cr><esc>:w<cr>:r!chmod +x <c-r>%<cr>
nnoremap ;aj :!amocrm-build uis<cr> 
nnoremap ;k{ mmvi{<esc>`<
nnoremap ;cs :SyntasticCheck<cr>:Errors<cr>
nnoremap ;co ya{<esc>`]a, <esc>p
nnoremap ;w i<cr><esc>^
nnoremap ;n %i<cr><esc><c-o>a<cr><esc>^
nnoremap ;x /,<cr>v/[^ ]<cr>hos,<cr><esc>
nnoremap ;sw i\<<esc>ea\><esc>v2F\"js
nnoremap ;yw i\<<esc>ea\><esc>v2F\"jyxxf\xxb
nnoremap ;yb b"kye
vnoremap ;rw :s/<c-r>j/<c-r>k/gc<cr>
nnoremap ;rw :%s/<c-r>j/<c-r>k/gc<cr>

nnoremap ;jv /\<var <cr>
nnoremap ;kv ?\<var <cr>

match ErrorMsg '\%>120v.\+'
nnoremap ;en 0120l
nnoremap ;o8 /^.\{121,\}$<cr>

nnoremap <f2> :set paste<cr>
inoremap <f2> <esc>:set paste<cr>i
nnoremap <f3> :set nopaste<cr>
nnoremap <f4> :!<cr>
nnoremap <f9> :r!sudo chmod 777 <c-r>%<cr>

nnoremap <c-h> <c-w>h
nnoremap <c-l> <c-w>l

nnoremap <c-k> :MBEbn<cr>
nnoremap <c-j> :MBEbp<cr>
nnoremap <c-c> :BW<cr>

nnoremap ;fo :.cc<cr>:ccl<cr>
nnoremap ;fh :ccl<cr>
nnoremap ;fs :cope<cr>

vnoremap <space> "jy
nnoremap <space> "jy
vnoremap , "jd
nnoremap , "jd
nnoremap <c-i> "jp

inoremap <c-h> <left>
inoremap <c-l> <right>
inoremap <c-c>l <end>
inoremap <c-c>h <esc>^i

inoremap <c-c>} <esc>/}<cr>a
inoremap <c-c>) <esc>/)<cr>a
inoremap <c-c>] <esc>/]<cr>a

inoremap <c-d><c-d> <esc>ddi<esc>k
inoremap <c-j> <cr>
inoremap <c-c>: :
inoremap <c-z><c-z> <esc>zza
inoremap <c-x> <bs>

inoremap <c-c>, <end>,<cr>
inoremap <c-c>; <esc>mmA;<esc>`ma

inoremap " ""<left>
inoremap ' ''<left>
inoremap ( ()<left>
inoremap ` ``<left>
inoremap [ []<esc>i
inoremap < <><esc>i
inoremap <c-c>< <
inoremap <c-c>' '
inoremap <c-c>" "
inoremap <c-c>{ {
inoremap <c-c>[ [
inoremap <c-c>( (
inoremap <c-c>` `

inoremap <c-k> <esc>
vnoremap <c-k> <esc>
cnoremap <c-k> <c-u><bs>
cnoremap <c-x> <bs>

function! SetManualFoldMethodIfNotDiff()
    if &foldmethod != 'diff'
        let &foldmethod = 'manual'
    endif
endfunction
au BufEnter * call SetManualFoldMethodIfNotDiff()

au BufNewFile * r!mkdir -p %:h

function! SetEslintExec(application)
    let g:syntastic_javascript_eslint_exec = "~/eslint/" . a:application . "/eslint"
endfunction

function! SetNewLineInsideCurlyBraces()
    inoremap { {<cr>}<esc>O
endfunction

function! SetUpDefault()
    call SetNewLineInsideCurlyBraces()
    let g:isReactApp = 0
    call SetEslintExec('comagic_web')
    execute "so ~/.vim/after/ftplugin/javascript_snippets.vim"
endfunction

function! SetUpEasyStart()
    let g:appName = 'EasyStart'
    let g:appPath = '/usr/local/src/gitlab.uis.dev/comagic_web/static/easystart/app'
    call SetUpDefault()
endfunction

function! SetUpComagic()
    let g:appName = 'Comagic'
    let g:appPath = '/usr/local/src/gitlab.uis.dev/comagic_web/static/comagic/app'
    call SetUpDefault()
endfunction

function! SetUpReact()
    nnoremap ;fc /\<[A-Z_]\+\><cr>
    nnoremap ;ec "jdeVsexport const <c-r>j = '<c-r>j';<esc>j^
    nnoremap ;fd /type:[ ]*[A-Z_]\+<cr>
    inoremap { {}<esc>i

    let g:isReactApp = 1
    execute "so ~/.vim/after/ftplugin/javascript_snippets.vim"
endfunction

function! SetUpEslint()
    let path = expand('%:p')

    if path =~ '\.js$' || path =~ '\.tsx$' || path =~ '\.ts$'
        let isReactApp = 0

        let isTest = stridx(path, '/bitrix_widget/tests/tests.js') != -1
        let isTest = isTest || stridx(path, '/sip_lib/tests/js/') != -1
        let isTest = isTest || stridx(path, '/comagic-tests/js/tests/') != -1
        let isTest = isTest || stridx(path, '/admin-frontend-tests/') != -1
        let isTest = isTest || stridx(path, '/proposal_generator_frontend_tests/') != -1
        let isTest = isTest || stridx(path, '/consultant_utils/tests/') != -1
        let isTest = isTest || stridx(path, '/uis_webrtc/tests/') != -1
        let isTest = isTest || stridx(path, '/comagic_app_tests/tests/') != -1
        let isTest = isTest || stridx(path, '/bitrix-digital-pipeline/tests/') != -1

        if isTest == 1
            noremap ;aa k^f)%Ix<esc>^zz
            noremap ;zz vi{o<esc>?desc<cr>zz
            noremap ;ab vi{<esc>joreturn;<esc>zz
        else
            let isReactApp = stridx(path, '/amocrm_widget/')  != -1
            let isReactApp = isReactApp || stridx(path, '/proposal_generator_frontend/')  != -1
            let isReactApp = isReactApp || stridx(path, '/admin_frontend/')  != -1
            let isReactApp = isReactApp || stridx(path, '/consultant/')  != -1
            let isReactApp = isReactApp || stridx(path, '/sip_lib/')  != -1
            let isReactApp = isReactApp || stridx(path, '/bitrix_widget/')  != -1
            let isReactApp = isReactApp || stridx(path, '/react_widget/')  != -1
            let isReactApp = isReactApp || stridx(path, '/call_center_frontend/') != -1
            let isReactApp = isReactApp || stridx(path, '/comagic_app/') != -1
            let isReactApp = isReactApp || stridx(path, '/softphone/') != -1
            let isReactApp = isReactApp || stridx(path, '/iframe_autoplay/') != -1
        endif

        let isReactApp = isReactApp || stridx(path, '/bitrix-digital-pipeline/')  != -1
        let isReactApp = isReactApp || stridx(path, '/admin-frontend-tests/')  != -1
        let isReactApp = isReactApp || stridx(path, '/proposal_generator_frontend_tests/')  != -1
        let isReactApp = isReactApp || stridx(path, '/consultant_utils/') != -1
        let isReactApp = isReactApp || stridx(path, '/uis_webrtc/') != -1
        let isReactApp = isReactApp || stridx(path, '/comagic_app_tests/') != -1
        let isReactApp = isReactApp || stridx(path, '/bitrix_widget/') != -1

        if stridx(path, '/bitrix-digital-pipeline/script.js') != -1
            let isReactApp = 0
        endif

        if stridx(path, '/comagic_web/static/easystart/') != -1
            call SetUpEasyStart()
        elseif isReactApp
            call SetUpReact()
            call SetEslintExec('call_center_frontend')

            let segment = '/proposal_generator_frontend'

            if stridx(path, segment . "/") != -1
                let lnpath = "~/eslint/proposal_generator_frontend/application"
                let rmcmd = "if [ -L " . lnpath .  " ]; then rm " . lnpath . "; fi"
                let lncmd =  "ln -s " . split(path, segment)[0] . segment . " " . lnpath

                let silentprefix = "normal!:silent !"
                let verboseprefix = "normal!:!"

                let prefix = silentprefix
                let enter = "\<cr>"

                execute prefix . rmcmd . enter
                execute prefix . lncmd . enter

                let g:syntastic_typescript_eslint_exec = "~/eslint/proposal_generator_frontend/eslint"
            endif
        else
            call SetUpComagic()
        endif
    elseif stridx(path, 'MiniBufExplorer') == -1 && stridx(path, 'NERD_tree_') == -1
        call SetNewLineInsideCurlyBraces()
    endif
endfunction

function! OpenNerdTree()
    if &diff == 0
        execute "NERDTree"
    endif
endfunction

au BufEnter * call SetUpEslint()
