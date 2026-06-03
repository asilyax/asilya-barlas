(function () {
  const hero = document.querySelector(".home-hero");
  const section = document.querySelector(".mockup-showcase");
  const primary = document.querySelector(".mockup-showcase__image--primary");
  const secondary = document.querySelector(".mockup-showcase__image--secondary");
  const mobile = window.matchMedia("(max-width: 640px)");
  const desktop = window.matchMedia("(min-width: 641px)");
  const tablet = window.matchMedia("(max-width: 1024px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const TILT_DELAY_MS = 300;

  if (!hero || !section || !primary || !secondary || reducedMotion.matches) {
    return;
  }

  primary.classList.add("is-mockup-slide");
  secondary.classList.add("is-mockup-slide");
  section.classList.add("is-mockup-scroll");

  let tiltTimer = null;
  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 0.85);
  }

  function getMotion() {
    if (mobile.matches) {
      return { moveX: 0, moveY: 320, scrollRange: 520, completeLead: 115 };
    }

    if (tablet.matches) {
      return { moveX: 76, moveY: 300, scrollRange: 580, completeLead: 130 };
    }

    return { moveX: 110, moveY: 440, scrollRange: 580, completeLead: 100 };
  }

  function getProgress(heroBottom, scrollRange, completeLead) {
    const raw = (scrollRange - heroBottom) / (scrollRange - completeLead);

    return easeOut(clamp(raw, 0, 1));
  }

  function getPerspective() {
    if (tablet.matches && !mobile.matches) {
      return { scaleStart: 0.9, opacityStart: 0.78 };
    }

    return { scaleStart: 0.88, opacityStart: 0.78 };
  }

  function setMotion(el, x, y, progress) {
    const { scaleStart, opacityStart } = getPerspective();
    const scale = scaleStart + (1 - scaleStart) * progress;
    const opacity = opacityStart + (1 - opacityStart) * progress;

    el.style.setProperty("--mockup-x", x + "px");
    el.style.setProperty("--mockup-y", y + "px");
    el.style.setProperty("--mockup-scale", String(scale));
    el.style.setProperty("--mockup-opacity", String(opacity));
  }

  function clearMotion(el) {
    el.style.removeProperty("--mockup-x");
    el.style.removeProperty("--mockup-y");
    el.style.removeProperty("--mockup-scale");
    el.style.removeProperty("--mockup-opacity");
  }

  function clearTilt() {
    clearTimeout(tiltTimer);
    tiltTimer = null;
    secondary.classList.remove("is-mockup-tilted", "is-mockup-tilting");
  }

  function clearGlow() {
    section.classList.remove("is-mockup-glow--visible");
    section.classList.remove("is-mockup-glow");
  }

  function showGlow() {
    if (section.classList.contains("is-mockup-glow--visible")) {
      return;
    }

    section.classList.add("is-mockup-glow");
    requestAnimationFrame(function () {
      section.classList.add("is-mockup-glow--visible");
    });
  }

  function scheduleTilt() {
    if (tiltTimer || secondary.classList.contains("is-mockup-tilted")) {
      return;
    }

    tiltTimer = setTimeout(function () {
      tiltTimer = null;
      secondary.classList.add("is-mockup-tilting");
      requestAnimationFrame(function () {
        secondary.classList.add("is-mockup-tilted");
      });
    }, TILT_DELAY_MS);
  }

  function update() {
    const { moveX, moveY, scrollRange, completeLead } = getMotion();
    const heroBottom = hero.getBoundingClientRect().bottom;
    const progress = getProgress(heroBottom, scrollRange, completeLead);
    const offset = 1 - progress;

    if (mobile.matches) {
      clearTilt();
      setMotion(primary, 0, offset * -moveY, progress);
      clearMotion(secondary);

      if (progress >= 1) {
        section.classList.add("is-mockup-complete");
        showGlow();
      } else {
        section.classList.remove("is-mockup-complete");
        clearGlow();
      }

      return;
    }

    setMotion(primary, offset * -moveX, offset * -moveY, progress);
    setMotion(secondary, offset * moveX, offset * -moveY, progress);

    if (progress >= 1) {
      section.classList.add("is-mockup-complete");
      showGlow();
      scheduleTilt();
    } else {
      section.classList.remove("is-mockup-complete");
      clearGlow();
      clearTilt();
    }
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );

  mobile.addEventListener("change", update);
  desktop.addEventListener("change", update);
  tablet.addEventListener("change", update);
  window.addEventListener("resize", update);
  update();
})();
