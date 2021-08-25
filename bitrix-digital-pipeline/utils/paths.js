const src = '/usr/local/src',
    utils = `${src}/utils`
    buildDir = `${src}/build`;

const randomString = length => {
   let result = '';
   const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
       charactersCount = characters.length;

   for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersCount));
   }

   return result;
};

module.exports = {
    nginxConfig: `${utils}/nginx.conf`,
    template: `${src}/template.html`,
    build: `${buildDir}/template.html`,
    script: `${src}/script.js`,
    style: `${src}/style.css`,
    pyBuilder: `${utils}/build`,
    pyRenderer: `${utils}/render`,
    getRandomFileName: () => `${buildDir}/${randomString(10)}`
};
