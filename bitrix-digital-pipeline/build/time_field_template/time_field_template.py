template = """<!DOCTYPE html>
<html>
<head>

<meta http-equiv="content-type" content="text/html; charset=utf-8">

<script>

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

</script>

<style>

body {
    font-family: sans-serif;
    font-size: 14px;
}

</style>

<script>document.addEventListener("DOMContentLoaded", function () {runApplication({{ timezone }});})</script>

</head>

<body></body>
</html>
"""
