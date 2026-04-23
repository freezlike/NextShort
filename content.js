let errorTimer = 0;
let lastTime = -1;

setInterval(() => {
    // 1. Target the currently active video container
    const activeContainer = document.querySelector('ytd-reel-video-renderer[is-active]') || document;
    
    // Target the "Next" button for Shorts
    const nextButton = document.querySelector('#navigation-button-down button') || document.querySelector('#navigation-button-down');

    // If there's no next button on the page, we can't do anything
    if (!nextButton) return;

    const video = activeContainer.querySelector('video');

    // 2. THE FIX: Detect if the video element is completely missing (Blocked, age-restricted, or removed)
    if (!video) {
        errorTimer++;
        if (errorTimer >= 5) {
            console.log("Video element missing (blocked or error), skipping to the next one.");
            nextButton.click();
            errorTimer = 0;
        }
        return; // Stop here for this cycle
    }

    // 3. Prevent the video from looping
    video.loop = false;

    // 4. If the video has ended normally, click the next button
    if (video.ended) {
        nextButton.click();
        errorTimer = 0;
        return;
    }

    // 5. Detect if the video is stuck buffering infinitely
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