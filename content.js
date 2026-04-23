let errorTimer = 0;
let lastTime = -1;

function checkVideoStatus() {
    // 1. --- ANTI-AFK BYPASS ---
    // Ferme la popup "Vidéo mise en pause. Continuer la lecture ?"
    const confirmButton = document.querySelector('yt-confirm-dialog-renderer #confirm-button') || document.querySelector('.yt-confirm-dialog-renderer button');
    if (confirmButton && confirmButton.offsetParent !== null) { 
        console.log("Anti-AFK activé : clic sur Continuer...");
        confirmButton.click();
        return;
    }

    // 2. --- AUTO-SKIP LOGIC ---
    // Cible le conteneur du Short actuellement visible
    const activeContainer = document.querySelector('ytd-reel-video-renderer[is-active]');
    if (!activeContainer) return;
    
    const video = activeContainer.querySelector('video');
    const nextButton = document.querySelector('#navigation-button-down button') || document.querySelector('#navigation-button-down');

    if (!video || !nextButton) return;

    // Désactive la boucle
    video.loop = false;

    // Passe au Short suivant si terminé
    if (video.ended) {
        console.log("Fin de la vidéo, passage à la suivante.");
        nextButton.click();
        errorTimer = 0;
        return;
    }

    // 3. --- ANTI-FREEZE LOGIC ---
    // Si la vidéo est censée jouer mais n'avance pas (et qu'elle a déjà commencé)
    if (!video.paused && video.currentTime === lastTime && video.currentTime > 0) {
        errorTimer++;
        if (errorTimer >= 10) { // Environ 5 secondes (puisque le check se fait toutes les 500ms)
            console.log("Vidéo bloquée détectée, saut d'urgence.");
            nextButton.click();
            errorTimer = 0;
        }
    } else {
        errorTimer = 0; 
    }
    
    lastTime = video.currentTime;
}

// Lancement de la boucle toutes les 500 millisecondes (plus réactif)
setInterval(checkVideoStatus, 500);

console.log("✅ NextShort V2 (Stable) loaded!");