const INTRO_HOLD_MS = 1000;
const INTRO_FADE_MS = 500;
const INTRO_DIVIDER_HIDE_MS = 700;
const INTRO_FONT_SPEC = '500 40px "IBM Plex Mono"';

const introRoot = document.getElementById("site-intro");
const docEl = document.documentElement;
const hero = document.querySelector(".home-hero");

function revealHeroGlow() {
  hero?.classList.add("is-glow-visible");
}

function finishIntro() {
  if (!introRoot) {
    return;
  }

  introRoot.classList.add("is-hidden");
  introRoot.setAttribute("aria-hidden", "true");
  docEl.classList.remove("is-intro-active");
  revealHeroGlow();
}

function startIntroFade() {
  if (!introRoot) {
    return;
  }

  revealHeroGlow();
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

function markIntroFontReady() {
  introRoot?.classList.add("is-font-ready");
}

async function ensureIntroFontReady() {
  if (!document.fonts?.load) {
    markIntroFontReady();
    return;
  }

  try {
    await document.fonts.load(INTRO_FONT_SPEC);
  } catch {
    // Font load failed — show text with fallback metrics.
  }

  markIntroFontReady();
}

async function runIntro() {
  if (!introRoot) {
    docEl.classList.remove("is-intro-active");
    revealHeroGlow();
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  introRoot.setAttribute("aria-hidden", "false");

  if (prefersReducedMotion) {
    markIntroFontReady();
    finishIntro();
    return;
  }

  await ensureIntroFontReady();

  // Unlock scroll immediately; overlay stays visible as a non-blocking layer.
  docEl.classList.remove("is-intro-active");

  window.setTimeout(() => {
    introRoot?.classList.add("is-divider-hidden");
  }, INTRO_DIVIDER_HIDE_MS);

  window.setTimeout(startIntroFade, INTRO_HOLD_MS);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void runIntro();
  });
} else {
  void runIntro();
}
