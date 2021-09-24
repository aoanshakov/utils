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

const createApplicationPaths = ({directory, ...params}) => {
    const root = `${src}/${directory}`,
        buildRoot = `${buildDir}/${directory}`;

    return {
        directory,
        htmlBuild: `${buildRoot}/template.html`,
        pyBuild: `${buildRoot}/${directory}.py`,
        template: `${root}/template.html`,
        script: `${root}/script.js`,
        style: `${root}/style.css`,
        ...params
    };
};

module.exports = {
    applications: [createApplicationPaths({
        directory: 'robot_settings',
        args: '{{ current_values|safe }}',
        dependencies: ['//api.bitrix24.com/api/v1/']
    }), createApplicationPaths({
        directory: 'time_field_template',
        args: '{{ timezone }}',
        dependencies: []
    })],
    nginxConfig: `${utils}/nginx.conf`,
    pyBuilder: `${utils}/build`,
    pyRenderer: `${utils}/render`,
    getRandomFileName: () => `${buildDir}/${randomString(10)}`
};
