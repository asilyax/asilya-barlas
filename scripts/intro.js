const INTRO_HOLD_MS = 2100;
const INTRO_FADE_MS = 600;

const introRoot = document.getElementById("site-intro");
const docEl = document.documentElement;

function finishIntro() {
  if (!introRoot) {
    return;
  }

  introRoot.classList.add("is-hidden");
  introRoot.setAttribute("aria-hidden", "true");
  docEl.classList.remove("is-intro-active");
}

function startIntroFade() {
  if (!introRoot) {
    return;
  }

  introRoot.classList.add("is-fading");
  introRoot.setAttribute("aria-hidden", "true");

  const onFadeEnd = (event) => {
    if (event.target !== introRoot || event.propertyName !== "opacity") {
      return;
    }

    introRoot.removeEventListener("transitionend", onFadeEnd);
    finishIntro();
  };

  introRoot.addEventListener("transitionend", onFadeEnd);

  window.setTimeout(() => {
    if (!introRoot.classList.contains("is-fading")) {
      return;
    }

    introRoot.removeEventListener("transitionend", onFadeEnd);
    finishIntro();
  }, INTRO_FADE_MS + 80);
}

function runIntro() {
  if (!introRoot) {
    docEl.classList.remove("is-intro-active");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  introRoot.setAttribute("aria-hidden", "false");

  if (prefersReducedMotion) {
    finishIntro();
    return;
  }

  window.setTimeout(startIntroFade, INTRO_HOLD_MS);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runIntro);
} else {
  runIntro();
}
