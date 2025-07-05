self.addEventListener('push', event => {
    const data = event.data?.json() || { title: 'Order Update', body: 'Your order status has been updated' };
    
    const options = {
        body: data.body,
        icon: '/path-to-your-logo.png',
        badge: '/path-to-your-badge.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    // Focus or open the app
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/orders');
            }
        })
    );
});