/**
 * Opens a new window and transfers the token
 * @param {string} url - The URL to open
 * @param {string} targetOrigin - The target origin that's allowed to receive the token
 * @returns {Window} The opened window instance
 */
export const openWindowWithToken = (url,) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('No token found');
        return null;
    }

    // Open the target window
    const targetWindow = window.open(url, "_blank",);

    // Send the token to the target window
    if (targetWindow) {
        // Store token in a transfer key
        localStorage.setItem('transferToken', token);
        
        // Give the new window some time to load
        setTimeout(() => {
            targetWindow.postMessage({ token }, url);
            console.log('Token sent to target window');
        }, 1000);
    }

    return targetWindow;
}; 