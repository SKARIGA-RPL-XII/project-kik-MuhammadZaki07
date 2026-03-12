export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const playNotificationSound = () => {
  const audio = new Audio("/sounds/sound_notification.mp3");
  audio.play().catch(() => {});
};
