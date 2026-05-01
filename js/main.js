const isLoginPage = document.getElementById("login");

function animateLogo(delay = 0) {
  const logo = document.getElementById("logo");
  if (!logo || logo.classList.contains("shrink")) return;

  setTimeout(() => {
    logo.classList.add("shrink");
  }, delay);
}

if (isLoginPage) {
  animateLogo(500);
}

function openSignUp() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.remove("hidden"); // anzeigen
  login.classList.add("hidden");     // verstecken
}

function openLogin() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.add("hidden");    // verstecken
  login.classList.remove("hidden");  // anzeigen
}