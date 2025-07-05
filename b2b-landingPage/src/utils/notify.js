// export function showNotification(title, options = {}) {
//   if ("Notification" in window && Notification.permission === "granted") {
//     new Notification(title, options);
//   }
// }


export const showNotification = (title, options) => {
    // Try browser notifications first
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
        return;
    }
    
    // Fallback to other notification methods
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        });
    } else {
        // Final fallback - use toast or alert
        console.log(title, options.body);
        // You could use toast.info here as a last resort
    }
};