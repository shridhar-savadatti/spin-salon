self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "booking-notification",
      requireInteraction: true,
      silent: false,
      vibrate: [300, 100, 300, 100, 300],
      data: { url: data.url || "/admin/appointments" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes("spinkudlu.com") && "focus" in client) {
          client.focus();
          client.navigate(event.notification.data?.url || "/admin/appointments");
          return;
        }
      }
      clients.openWindow(event.notification.data?.url || "/admin/appointments");
    })
  );
});
