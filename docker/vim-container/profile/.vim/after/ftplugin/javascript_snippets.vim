inoremap <buffer> : :<space>

if !exists('loaded_snippet') || &cp
    finish
endif

let st = g:snip_start_tag
let et = g:snip_end_tag
let cd = g:snip_elem_delim

function! GetExtjsClassName()
    let cls = expand('%:p')
    let cls = substitute(cls, g:appPath, g:appName, 'g')
    let cls = substitute(cls, '/', '.', 'g') 
    let cls = substitute(cls, '.js', '', 'g')

    return cls
endfunction

function! ArrowFunctionArguments(arguments)
    let arguments = a:arguments

    if arguments == 'arguments'
        let arguments = ''
    endif

    let arguments = trim(arguments)

    if empty(arguments) || !empty(matchstr(arguments, '[^a-zA-Z_0-9]\+'))
        return '('. arguments .')'
    endif
    
    return arguments
endfunction

nnoremap ;sn :e ~/.vim/after/ftplugin/javascript_snippets.vim<cr>
nnoremap ;sa f'vi'o<esc>hi<cr><esc>^vi'<esc>/function<cr>vF,ohs,<cr><esc><<k^
nnoremap ;sc i' +<cr>'<esc>
nnoremap ;js $F'v/'<cr>x

exec "Snippet cc /**<cr>".st.et."<cr>/"
exec "Snippet @pr @property {".st.et."} [".st.et."] ".st.et
exec "Snippet @c @config {".st.et."} [".st.et."] ".st.et
exec "Snippet @o @option {".st.et."} [".st.et."] ".st.et
exec "Snippet @p @param {".st.et."} [".st.et."] ".st.et
exec "Snippet @r @return {".st.et."} ".st.et

if g:isReactApp
    exec "Snippet ef () => null".st.et
    exec "Snippet m ".st.et."(".st.et.") {<cr>".st.et."<cr>}"
    exec "Snippet f ".st."arguments:ArrowFunctionArguments(@z)".et." => {<cr>".st.et."<cr>}"
    exec "Snippet fo ".st."arguments:ArrowFunctionArguments(@z)".et." => ".st.et
    exec "Snippet c const ".st.et." = ".st.et
    exec "Snippet e export ".st.et
    exec "Snippet ec export const ".st.et." = ".st.et
    exec "Snippet ed export default ".st.et
    exec "Snippet div <div>".st.et."</div>"
    exec "Snippet h2 <h2>".st.et."</h2>"
    exec "Snippet cn className=".st.et
    exec "Snippet fr <React.Fragment>".st.et."</React.Fragment>"
    exec "Snippet i1 i18n('".st.et."')"
    exec "Snippet im import ".st.et." from '".st.et."';"
    exec "Snippet sw switch (" .st.et. ") {<cr>".st.et."<cr>}"
    exec "Snippet ca case ".st.et.":<cr>".st.et
    exec "Snippet br break;".st.et
else
    exec "Snippet ef function () {}".st.et
    exec "Snippet m this.".st.et." = function (".st.et.") {<cr>".st.et."<cr>};"
    exec "Snippet f function (".st.et.") {<cr>".st.et."<cr>}"
    exec "Snippet i1 i18n('".st.et."')"
    inoremap { {<cr>}<esc>O
endif

exec "Snippet mc ".st.et.": function (".st.et.") {<cr>".st.et."<cr>}"
exec "Snippet fn function ".st.et." (".st.et.") {<cr>".st.et."<cr>}"

exec "Snippet if if (".st.et.") {<cr>".st.et."<cr>}"
exec "Snippet else else {<cr>".st.et."<cr>}"

exec "Snippet fori for (".st.et." in ".st.et.") {<cr>".st.et."<cr>}"
exec "Snippet for for (".st.et." = 0; ".st.et." < length; ".st.et." ++) {<cr>".st.et."<cr>}"
exec "Snippet while while (".st.et.") {<cr>".st.et."<cr>}"

exec "Snippet try try {<cr>".st.et."<cr>} catch (e) {<cr>".st.et."<cr>}"
exec "Snippet ex extends ".st.et." "

exec "Snippet co const ".st.et." = ".st.et.";"
exec "Snippet le let ".st.et." = ".st.et.";"

exec "Snippet cl class ".st.et." {<cr>".st.et."<cr>}"
exec "Snippet ex class ".st.et." extends ".st.et." {<cr>".st.et."<cr>}"

exec "Snippet col {<cr>header: i18n('".st.et."'),<cr>dataIndex: '".st.et."'<cr>}, ".st.et
exec "Snippet fi {<cr>name: '".st.et."',<cr>type: '".st.et."'<cr>}, ".st.et
exec "Snippet cal this.callParent(arguments);".st.et

exec "Snippet def Ext.define('". GetExtjsClassName() ."', {<cr>".st.et."<cr>});"
exec "Snippet cre Ext.create('".st.et."'".st.et.")".st.et

exec "Snippet cons console.log(".st.et.");"

exec "Snippet du jsTestDebug.printExtJsComponent(".st.et.");"
exec "Snippet log jsTestDebug.printVariable(".st.et.");"
exec "Snippet no jsTestDebug.printVariable(".st.et.");"
exec "Snippet tra jsTestDebug.printCallStack();"

exec "Snippet it it('".st.et."', function() {<cr>".st.et."<cr>});"
exec "Snippet tt tt('".st.et."', function(t) {<cr>".st.et."<cr>});"
exec "Snippet de describe('".st.et."', function() {<cr>".st.et."<cr>});"
exec "Snippet su beforeEach(function() {<cr>".st.et."<cr>});"
exec "Snippet ae afterEach(function() {<cr>".st.et."<cr>});"

exec "Snippet be expect(".st.et.").toBe(".st.et.");"
exec "Snippet eq expect(".st.et.").toEqual(".st.et.");"
