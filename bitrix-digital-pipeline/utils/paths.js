const src = '/usr/local/src';

module.exports = {
    nginxConfig: `${src}/utils/nginx.conf`,
    template: `${src}/template.html`,
    build: `${src}/build/template.html`,
    script: `${src}/script.js`,
    style: `${src}/style.css`
};
