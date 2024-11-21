const showMessage = message => (document.getElementById('app').innerHTML = message);

Notification.requestPermission()
    .then(() => {
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
            showMessage('Notifications are disabled');
            return;
        }

        showMessage('Notifications are enabled');
        const notification = new Notification('Some title', { body: 'Some text' });

        notification.addEventListener(
            'click',

            () => {
                notification.close();
                showMessage('Notification clicked');
            }
        );
    })
    .catch(e => console.error(e));
