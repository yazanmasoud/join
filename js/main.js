const isLoginPage = document.getElementById("login");

function animateLogo(delay = 0) {
  const logo = document.getElementById("logo");
  const login = document.getElementById("login");

  if (!logo || !login || logo.classList.contains("shrink")) return;

  setTimeout(() => {
    logo.classList.add("shrink");

    const transitionMs = 700;
    const bufferMs = 120; // small buffer to ensure animation finished
    setTimeout(() => {
      logo.classList.add('final');
      login.classList.remove('hidden');
    }, transitionMs + bufferMs);
  }, delay);
}

if (isLoginPage) {
  animateLogo(500);
}

function openSignUp() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.remove("hidden");
  login.classList.add("hidden");
}

function openLogin() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.add("hidden");
  login.classList.remove("hidden");
}