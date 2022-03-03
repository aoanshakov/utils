const axios = require('axios');

const src = '/usr/local/src',
    tests = `${src}/tests`,
    applicationDir = `${src}/electron`,
    dist = `${applicationDir}/dist`,
    packageJson = `${applicationDir}/package.json`;
let token;

axios.defaults.baseURL = 'http://127.0.0.1/api';

const authenticate = () => new Promise((resolve, reject) => {
    const {
        username,
        password
    } = require(`${tests}/updater/config/local.js`).auth.static;

    console.log('Trying to authenticate');

    return axios.get(`auth/login?username=${username}&password=${password}`).
        then(response => {
            token = ((response || {}).data || {}).token;
            token && console.log('Authentication succeded');

            axios.defaults.headers['Authorization'] = `Bearer ${token}`;
            resolve();
        }).
        catch(error => reject(['Failed to authenticate', error]));
});

const addVersion = () => new Promise((resolve, reject) => {
    const {version} = require(packageJson);
    console.log(`Trying to add version ${version}`);

    return axios({
        url: 'version',
        method: 'post',
        data: {
            name: version,
            notes: '',
            channel: {
                name: 'stable'
            },
            availability: (new Date()).toISOString(),
            flavor: {
                name: 'default'
            }
        }
    }).
    then(response => (console.log('Version is successfully added', response.data), resolve())).
    catch(error => {
        ((((error || {}).response || {}).data || {}).originalError || {}).code == '23505' &&
            (error = 'version already exists')

        reject(['Failed to add version', error])
    });
});

const publish = name => () => new Promise((resolve, reject) => {
    Promise.resolve().then(() => {
        const {version} = require(packageJson);
        console.log(`Trying to publish asset ${name} for version ${version}`);

        const FormData = require('form-data'),
            form = new FormData();

        form.append('token', token);
        form.append('platform', 'windows_64');
        form.append('version', version);
        form.append('file', require('fs').createReadStream(`${dist}/${name}`));

        return form;
    }).
    then(form => axios({
        url: `asset`,
        method: 'post',
        data: form,
        headers: form.getHeaders(),
        maxBodyLength: Infinity
    })).
    then(response => (console.log('Publishing succeded', ((response || {}).data || {})), resolve())).
    catch(error => reject(['Failed to publish', error]))
});

authenticate().
    then(addVersion).
    then(publish('Softphone.exe')).
    then(publish('Softphone.exe.blockmap')).
    catch(error => console.log(`${error[0]}:`, error[1]));
