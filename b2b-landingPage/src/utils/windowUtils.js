/**
 * Opens a new window with cookie-based authentication
 * @param {string} url - The URL to open
 * @param {string} targetOrigin - The target origin for postMessage
 * @returns {Window} The opened window instance
 */
export const openWindowWithToken = (url, targetOrigin) => {
    console.log('Opening window with URL:', url);
    // Open the target window
    const targetWindow = window.open(url, "_blank");
    
    if (targetWindow) {
        console.log('Target window opened successfully');
        // Wait for the new window to load
        const checkWindowLoaded = setInterval(() => {
            try {
                console.log('Attempting to send message to target window');
                // Send a message to the target window to initiate token transfer
                targetWindow.postMessage({
                    type: 'INITIATE_TOKEN_TRANSFER',
                    sourceOrigin: window.location.origin
                }, targetOrigin || url);
                console.log('Message sent successfully');

                // Clear the interval once message is sent
                clearInterval(checkWindowLoaded);
            } catch (error) {
                // Window might not be ready yet, continue checking
                console.log('Error sending message:', error);
            }
        }, 100);

        // Clean up interval after 5 seconds if window doesn't load
        setTimeout(() => {
            clearInterval(checkWindowLoaded);
        }, 5000);
    } else {
        console.log('Failed to open target window');
    }

    return targetWindow;
}; 