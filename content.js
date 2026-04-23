// 1. --- ANTI-VEILLE YOUTUBE (MAIN WORLD INJECTION) ---
// Ce bloc fait croire à la page YouTube que l'onglet est toujours visible
const spoofVisibility = document.createElement('script');
spoofVisibility.textContent = `
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
    Object.defineProperty(document, 'hidden', { get: () => false });
    window.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);
`;
document.documentElement.appendChild(spoofVisibility);
spoofVisibility.remove();

// 2. --- LOGIQUE PRINCIPALE ---
let errorTimer = 0;
let lastTime = -1;
let observedVideo = null; // Permet de mémoriser la vidéo qu'on écoute

setInterval(() => {
    const activeContainer = document.querySelector('ytd-reel-video-renderer[is-active]') || document;
    const nextButton = document.querySelector('#navigation-button-down button') || document.querySelector('#navigation-button-down');

    if (!nextButton) return;

    // Gérer l'écran d'erreur (Video unavailable)
    const skipErrorButton = activeContainer.querySelector('yt-playability-error-supported-renderers button') || activeContainer.querySelector('#error-screen button');
    if (skipErrorButton && skipErrorButton.offsetParent !== null) {
        skipErrorButton.click();
        errorTimer = 0;
        return;
    }

    const video = activeContainer.querySelector('video');

    // Gérer la disparition complète du lecteur
    if (!video) {
        errorTimer++;
        if (errorTimer >= 5) {
            nextButton.click();
            errorTimer = 0;
        }
        return; 
    }

    video.loop = false;

    // 3. --- LE SECRET POUR L'ARRIÈRE-PLAN ---
    // On attache un événement natif à la vidéo. Quand elle se termine, 
    // le navigateur déclenche ça immédiatement, même si l'onglet est inactif !
    if (video !== observedVideo) {
        observedVideo = video;
        video.addEventListener('ended', () => {
            console.log("Fin de vidéo détectée en arrière-plan. Suivante !");
            nextButton.click();
            errorTimer = 0;
        }, { once: true }); // "once: true" garantit que l'événement ne s'ajoute qu'une seule fois
    }

    // Sécurité de secours au cas où l'événement rate
    if (video.ended) {
        nextButton.click();
        errorTimer = 0;
        return;
    }

    // Anti-Freeze (bloqué en chargement)
    if (!video.paused && video.currentTime === lastTime) {
        errorTimer++;
        if (errorTimer >= 5) {
            console.log("Vidéo bloquée, passage à la suivante.");
            nextButton.click();
            errorTimer = 0;
        }
    } else {
        errorTimer = 0; 
    }
    
    lastTime = video.currentTime;

}, 1000);

console.log("NextShort: Auto-Swipe loaded!");