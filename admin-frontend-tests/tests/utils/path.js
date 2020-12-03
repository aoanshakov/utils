define(() => {
    return function ({history, utils}) {
        const getQuery = () => utils.parseUrl(history.location.search).query;

        this.open = (path, query) => history.push(path + utils.encodeQuery(query));

        this.logQuery = () => console.log(getQuery().getDescription());

        this.expectQueryToContain = expectedContent => {
            getQuery().expectToContain(expectedContent);
        }
    };
});
