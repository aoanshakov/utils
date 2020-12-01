const src = '/usr/local/src',
    adminFrontend = `${src}/admin_frontend`,
    testsRoot = `${src}/tests`;

module.exports = {
    adminFrontend,
    testsRoot,
    indexHtml: `${adminFrontend}/build/index.html`,
    testsHtml: `${testsRoot}/tests/tests.html`,
    adminFrontendPatch: `${testsRoot}/admin-frontend-patch.diff`
};
