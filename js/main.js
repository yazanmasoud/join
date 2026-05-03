function animateLogo(delay = 0) {
  const logo = document.querySelector(".logo-start");
  if (!logo) return;

  setTimeout(() => {
    logo.classList.add("shrink");
  }, delay);
}

animateLogo(1500);