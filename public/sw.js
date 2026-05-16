let badgeCount = 0;

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  badgeCount++;

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "booking-" + Date.now(),
        requireInteraction: true,
        silent: false,
        vibrate: [300, 100, 300, 100, 300],
        data: { url: data.url || "/admin/appointments", count: badgeCount },
        actions: [
          { action: "view", title: "View Booking" },
          { action: "dismiss", title: "Dismiss" },
        ],
      }),
      // Set app icon badge count
      self.navigator?.setAppBadge?.(badgeCount).catch(() => {}),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  // Clear badge when notification is clicked
  badgeCount = Math.max(0, badgeCount - 1);
  self.navigator?.setAppBadge?.(badgeCount || undefined).catch(() => {});
  if (badgeCount === 0) self.navigator?.clearAppBadge?.().catch(() => {});

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

// Clear badge when admin page is opened
self.addEventListener("message", (event) => {
  if (event.data === "clear-badge") {
    badgeCount = 0;
    self.navigator?.clearAppBadge?.().catch(() => {});
  }
});
