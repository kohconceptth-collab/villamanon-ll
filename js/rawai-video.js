(() => {
  const video = document.getElementById('rawaiVideo');
  if (!video) return;

  const mobileOrTablet = window.matchMedia('(max-width: 1024px)');

  // Autoplay mobile fiable : la vidéo doit rester muette, y compris après
  // la première interaction de l'utilisateur.
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  let retryTimer = 0;
  let retryAttempts = 0;

  const tryPlay = (reset = false) => {
    if (document.hidden) return;
    video.muted = true;
    video.defaultMuted = true;

    if (reset && video.readyState >= 1 && (!Number.isFinite(video.currentTime) || video.ended)) {
      video.currentTime = 0;
    }

    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        if (!mobileOrTablet.matches || retryAttempts >= 6) return;
        retryAttempts += 1;
        window.clearTimeout(retryTimer);
        retryTimer = window.setTimeout(() => tryPlay(), 350);
      });
    }
  };

  const resumePlayback = () => {
    if (!document.hidden && (video.paused || video.ended)) tryPlay(true);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryPlay(), { once: true });
  } else {
    tryPlay();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resumePlayback();
  });

  window.addEventListener('pageshow', resumePlayback);
  window.addEventListener('focus', resumePlayback);
  window.addEventListener('online', resumePlayback);
  window.addEventListener('orientationchange', () => window.setTimeout(resumePlayback, 150));

  ['loadedmetadata', 'loadeddata', 'canplay', 'stalled', 'suspend'].forEach(eventName => {
    video.addEventListener(eventName, resumePlayback);
  });
  video.addEventListener('playing', () => {
    retryAttempts = 0;
    window.clearTimeout(retryTimer);
  });

  // Un geste utilisateur offre une nouvelle occasion de lancer la lecture,
  // sans jamais activer le son et sans modifier l'interface.
  document.addEventListener('pointerdown', resumePlayback, { passive: true });
  document.addEventListener('touchstart', resumePlayback, { passive: true });
})();
