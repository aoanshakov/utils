const notify() {
    if (Notification.permission === 'granted') {
        const notification = new Notification('Появилась запись');
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                const notification = new Notification('Появилась запись');
            }
        });
    }
}
