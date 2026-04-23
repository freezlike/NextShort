let errorTimer = 0;
let lastTime = -1;

setInterval(() => {
    // 1. Target the currently active video container
    const activeContainer = document.querySelector('ytd-reel-video-renderer[is-active]') || document;
    
    // Target the standard "Next" button for Shorts
    const nextButton = document.querySelector('#navigation-button-down button') || document.querySelector('#navigation-button-down');

    if (!nextButton) return;

    // 2. THE NEW FIX: Detect the "Video unavailable / Skip video" overlay from your screenshot
    const skipErrorButton = activeContainer.querySelector('yt-playability-error-supported-renderers button') || activeContainer.querySelector('#error-screen button');
    if (skipErrorButton && skipErrorButton.offsetParent !== null) {
        console.log("Video unavailable interstitial detected. Clicking 'Skip video'...");
        skipErrorButton.click();
        errorTimer = 0;
        return; // Stop here, the click will naturally move to the next video
    }

    const video = activeContainer.querySelector('video');

    // 3. Detect if the video element is completely missing for any other reason
    if (!video) {
        errorTimer++;
        if (errorTimer >= 5) {
            console.log("Video element missing, skipping to the next one.");
            nextButton.click();
            errorTimer = 0;
        }
        return; 
    }

    // 4. Prevent the video from looping
    video.loop = false;

    // 5. If the video has ended normally, click the next button
    if (video.ended) {
        nextButton.click();
        errorTimer = 0;
        return;
    }

    // 6. Detect if the video is stuck buffering infinitely
    if (!video.paused && video.currentTime === lastTime) {
        errorTimer++;
        if (errorTimer >= 5) {
            console.log("Video is stuck buffering, skipping to the next one.");
            nextButton.click();
            errorTimer = 0;
        }
    } else {
        errorTimer = 0; // Reset the timer if everything is fine
    }
    
    lastTime = video.currentTime;

}, 1000);

console.log("NextShort: Auto-Swipe loaded successfully!");