let errorTimer = 0;
let lastTime = -1;

// 1. We put the main logic inside a function
function checkVideoStatus() {
    // --- ANTI-AFK BYPASS ---
    // If YouTube asks "Video paused. Continue watching?", auto-click "Yes"
    const confirmButton = document.querySelector('yt-confirm-dialog-renderer #confirm-button') || document.querySelector('.yt-confirm-dialog-renderer button');
    if (confirmButton && confirmButton.offsetParent !== null) { // Checks if the button is visible
        console.log("Anti-AFK popup detected. Clicking continue...");
        confirmButton.click();
        return;
    }

    // --- AUTO-SKIP LOGIC ---
    // Target the currently active video on the screen
    const activeContainer = document.querySelector('ytd-reel-video-renderer[is-active]') || document;
    const video = activeContainer.querySelector('video');
    
    // Target the "Next" button for Shorts
    const nextButton = document.querySelector('#navigation-button-down button') || document.querySelector('#navigation-button-down');

    if (!video || !nextButton) return;

    // Prevent the video from looping
    video.loop = false;

    // If the video has ended, click the next button
    if (video.ended) {
        nextButton.click();
        errorTimer = 0;
        return;
    }

    // Detect if the video is stuck, unavailable, or buffering infinitely
    if (!video.paused && video.currentTime === lastTime) {
        errorTimer++;
        if (errorTimer >= 5) {
            console.log("Video is stuck or unavailable, skipping to the next one.");
            nextButton.click();
            errorTimer = 0;
        }
    } else {
        errorTimer = 0; 
    }
    
    lastTime = video.currentTime;
}

// 2. THE WEB WORKER HACK (Anti-Sleep for background tabs)
// We create a separate background thread just for the timer
const workerCode = `
    setInterval(() => {
        postMessage('tick');
    }, 1000);
`;

// Convert the string into a Blob URL that the browser can run as a worker
const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

// Every time the worker "ticks" (every 1 second), run our function
worker.onmessage = () => {
    checkVideoStatus();
};

console.log("✅ NextShort (Background/Anti-Sleep Edition) loaded!");