function runApplication (timeZone) {
    function render () {
        document.body.innerHTML = (new Date(Date.now())).toLocaleString('en-GB', { timeZone: timeZone }).
            split(',')[1].trim().
            split(':').slice(0, 2).
            join(':');
    }

    setInterval(render, 60000);
    render();
}
