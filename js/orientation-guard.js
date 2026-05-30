const MOBILE_LANDSCAPE_MAX_HEIGHT = 500;

function isMobileLandscape() {
  return (
    window.innerWidth > window.innerHeight &&
    window.innerHeight <= MOBILE_LANDSCAPE_MAX_HEIGHT
  );
}

function updateOrientationGuard() {
  document.body.classList.toggle(
    'landscape-blocked',
    isMobileLandscape()
  );
}

window.addEventListener('resize', updateOrientationGuard);
window.addEventListener('orientationchange', updateOrientationGuard);
updateOrientationGuard();
