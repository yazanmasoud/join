const MOBILE_LANDSCAPE_MAX_HEIGHT = 500;

/**
 * Detects whether the viewport is a mobile landscape layout.
 *
 * @returns {boolean} True if the viewport should be blocked.
 */
function isMobileLandscape() {
  return (
    window.innerWidth > window.innerHeight &&
    window.innerHeight <= MOBILE_LANDSCAPE_MAX_HEIGHT
  );
}

/**
 * Toggles the body class that hides the app in mobile landscape orientation.
 *
 * @returns {void}
 */
function updateOrientationGuard() {
  document.body.classList.toggle(
    'landscape-blocked',
    isMobileLandscape()
  );
}

window.addEventListener('resize', updateOrientationGuard);
window.addEventListener('orientationchange', updateOrientationGuard);
updateOrientationGuard();
