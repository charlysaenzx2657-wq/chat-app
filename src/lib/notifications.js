// Notificaciones nativas del navegador (API Notification), sin backend ni costo.
// Solo funcionan si el usuario dio permiso, y mientras haya una pestaña de la
// app abierta en algún lugar (aunque no esté enfocada).

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission; // "granted" | "denied" | "default"
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return await Notification.requestPermission();
}

export function showMessageNotification({ senderName, text, onClick }) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  const body = text?.trim() ? text : "Te envió un archivo";
  const n = new Notification(senderName, {
    body,
    icon: "/icon.png", // opcional: agrega un ícono en /public si quieres
    tag: "chat-message", // agrupa notificaciones seguidas en vez de amontonarlas
  });

  if (onClick) {
    n.onclick = () => {
      window.focus();
      onClick();
      n.close();
    };
  }
}
