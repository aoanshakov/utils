const src = '/usr/local/src',
    utils = `${src}/utils`;

module.exports = {
    nginxConfig: `${utils}/nginx.conf`,
    template: `${src}/template.html`,
    build: `${src}/build/template.html`,
    script: `${src}/script.js`,
    style: `${src}/style.css`,
    pyBuilder: `${utils}/build`
};
