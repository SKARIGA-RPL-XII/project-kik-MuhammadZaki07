self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'PLAY_SOUND',
            file: '/sounds/sound_notification.mp3'
          });
        });

        let targetPath = data.data?.url || data.url || '/notifications';
        
        let finalUrl;
        if (targetPath.startsWith('http')) {
            let urlObj = new URL(targetPath);
            finalUrl = self.location.origin + urlObj.pathname + urlObj.search;
        } else {
            finalUrl = self.location.origin + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
        }

        return self.registration.showNotification(data.title || 'Notifikasi', {
          body: data.body || 'Ada pesan baru',
          icon: '/notification.png',
          data: { url: finalUrl }
        });
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});