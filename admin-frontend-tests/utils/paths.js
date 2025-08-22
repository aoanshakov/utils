const src = '/usr/local/src',
    adminFrontend = `${src}/admin_frontend`,
    nodeModules = `${adminFrontend}/node_modules`,
    testsRoot = `${src}/tests`;

module.exports = {
    adminFrontend,
    scheduler: `${nodeModules}/scheduler`,
    schedulerPatch: `${testsRoot}/scheduler-patch.diff`,
    testsRoot,
    indexHtml: `${adminFrontend}/build/index.html`,
    testsHtml: `${testsRoot}/tests/tests.html`,
    adminFrontendPatch: `${testsRoot}/admin-frontend-patch.diff`
};
