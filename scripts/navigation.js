const menuToggle = document.querySelector(".site-header__menu-toggle");
const menuCloseLinks = document.querySelectorAll(
  ".site-header__logo, .site-header__mobile-menu a",
);

menuCloseLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (menuToggle) {
      menuToggle.checked = false;
    }
  });
});

const siteHeader = document.querySelector(".site-header");
const homeHero = document.querySelector(".home-hero");

/** Scroll Y above which hide-on-scroll-down / show-on-scroll-up applies. */
function scrollBehaviorThresholdY() {
  if (!homeHero) {
    return 56;
  }
  const band = Math.min(220, Math.max(120, Math.round(homeHero.offsetHeight * 0.22)));
  return homeHero.offsetTop + band;
}

let lastScrollY = window.scrollY;
let headerScrollRaf = 0;

function syncHeaderScrollBehavior() {
  headerScrollRaf = 0;
  if (!siteHeader) {
    return;
  }

  if (menuToggle?.checked) {
    siteHeader.classList.remove("site-header--hidden");
    lastScrollY = window.scrollY;
    return;
  }

  const y = window.scrollY;
  const threshold = scrollBehaviorThresholdY();

  if (y <= threshold) {
    siteHeader.classList.remove("site-header--hidden");
    lastScrollY = y;
    return;
  }

  const delta = y - lastScrollY;
  lastScrollY = y;

  if (Math.abs(delta) < 6) {
    return;
  }

  if (delta > 0) {
    siteHeader.classList.add("site-header--hidden");
  } else {
    siteHeader.classList.remove("site-header--hidden");
  }
}

function scheduleHeaderScrollSync() {
  if (!siteHeader) {
    return;
  }
  if (headerScrollRaf) {
    return;
  }
  headerScrollRaf = requestAnimationFrame(syncHeaderScrollBehavior);
}

if (menuToggle) {
  menuToggle.addEventListener("change", () => {
    if (menuToggle.checked) {
      siteHeader?.classList.remove("site-header--hidden");
    }
    lastScrollY = window.scrollY;
  });
}

window.addEventListener("scroll", scheduleHeaderScrollSync, { passive: true });
window.addEventListener("resize", () => {
  lastScrollY = window.scrollY;
  syncHeaderScrollBehavior();
});

scheduleHeaderScrollSync();
