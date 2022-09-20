const axios = require('axios'),
    {Args, isOneOf, isString} = require('../utils/arguments');
let token;

const {
    version,
    project,
    username,
    password,
    filepath,
    apiurl
} = (new Args({
    apiurl: {
        validate: isString
    },
    filepath: {
        validate: isString
    },
    username: {
        validate: isString
    },
    password: {
        validate: isString
    },
    version: {
        validate: isString
    },
    project: {
        validate: isOneOf.apply(null, ['comagic', 'uis2', 'usa'])
    }
})).createObjectFromArgsArray(process.argv);

if (!version) {
    console.log('Version is not specified');
    return;
}

axios.defaults.baseURL = apiurl;

const authenticate = () => new Promise((resolve, reject) => {
    console.log('Trying to authenticate');

    return axios.get('auth/login?' + Object.entries({
        username,
        password
    }).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')).
        then(response => {
            token = ((response || {}).data || {}).token;
            token && console.log('Authentication succeded');

            axios.defaults.headers['Authorization'] = `Bearer ${token}`;
            resolve();
        }).
        catch(error => reject(['Failed to authenticate', error]));
});

const addVersion = () => new Promise((resolve, reject) => {
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
                name: project == 'comagic' ? 'default' : project
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

const publish = (path, suffix = '') => () => new Promise((resolve, reject) => {
    Promise.resolve().then(() => {
        console.log(
            `Trying to publish asset ${path} for version ${version}${project ? ` and project ${project}` : ''}`
        );

        const FormData = require('form-data'),
            form = new FormData();

        form.append('token', token);
        //form.append('name', `softphone${project != 'usa' ? '-uis' : ''}.exe${suffix}`);
        form.append('platform', 'windows_64');
        form.append('version', `${version}${project != 'comagic' ? `_${project}` : ''}`);
        form.append('file', require('fs').createReadStream(path));

        return form;
    }).
    then(form => axios({
        url: 'asset',
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
    then(publish(filepath)).
    then(publish(`${filepath}.blockmap`, '.blockmap')).
    catch(error => console.log(`${error[0]}:`, error[1]));
