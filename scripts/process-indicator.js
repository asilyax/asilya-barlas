(function () {
  const timeline = document.querySelector(".process__timeline");
  const rail = document.querySelector(".process__rail");
  const desktopIndicator = document.querySelector(".process__indicator");
  const railIndicator = document.querySelector(".process__rail-indicator");
  const mobileQuery = window.matchMedia("(max-width: 640px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!timeline && !rail) {
    return;
  }

  let isDragging = false;
  let activeIndicator = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getTrack() {
    if (mobileQuery.matches && rail) {
      return { container: rail, track: rail };
    }

    if (timeline) {
      return { container: timeline, track: timeline };
    }

    return null;
  }

  function progressFromClientY(trackEl, clientY) {
    const rect = trackEl.getBoundingClientRect();

    if (rect.height <= 0) {
      return 0;
    }

    return clamp((clientY - rect.top) / rect.height, 0, 1);
  }

  function progressFromScroll(trackEl) {
    const rect = trackEl.getBoundingClientRect();
    const anchor = window.innerHeight * 0.45;

    if (rect.height <= 0) {
      return 0;
    }

    return clamp((anchor - rect.top) / rect.height, 0, 1);
  }

  function setProgress(container, progress) {
    container.style.setProperty("--process-progress", progress * 100 + "%");
  }

  function scrollForProgress(progress) {
    const trackInfo = getTrack();

    if (!trackInfo) {
      return;
    }

    const rect = trackInfo.track.getBoundingClientRect();
    const anchor = window.innerHeight * 0.45;
    const dotY = window.scrollY + rect.top + progress * rect.height;

    window.scrollTo({
      top: dotY - anchor,
      behavior: "auto",
    });
  }

  function updateFromScroll() {
    if (isDragging || reducedMotion.matches) {
      return;
    }

    const trackInfo = getTrack();

    if (!trackInfo) {
      return;
    }

    setProgress(trackInfo.container, progressFromScroll(trackInfo.track));
  }

  function bindDrag(indicator, container, track) {
    if (!indicator || !container || !track) {
      return;
    }

    indicator.addEventListener("pointerdown", function (event) {
      if (reducedMotion.matches) {
        return;
      }

      isDragging = true;
      activeIndicator = indicator;
      indicator.setPointerCapture(event.pointerId);
      event.preventDefault();

      const progress = progressFromClientY(track, event.clientY);
      setProgress(container, progress);
      scrollForProgress(progress);
    });

    indicator.addEventListener("pointermove", function (event) {
      if (!isDragging || activeIndicator !== indicator) {
        return;
      }

      const progress = progressFromClientY(track, event.clientY);
      setProgress(container, progress);
      scrollForProgress(progress);
    });

    function endDrag(event) {
      if (!isDragging || activeIndicator !== indicator) {
        return;
      }

      isDragging = false;
      activeIndicator = null;

      if (indicator.hasPointerCapture(event.pointerId)) {
        indicator.releasePointerCapture(event.pointerId);
      }
    }

    indicator.addEventListener("pointerup", endDrag);
    indicator.addEventListener("pointercancel", endDrag);
  }

  bindDrag(desktopIndicator, timeline, timeline);
  bindDrag(railIndicator, rail, rail);

  let ticking = false;

  function scheduleUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;

    requestAnimationFrame(function () {
      if (reducedMotion.matches) {
        if (timeline) {
          setProgress(timeline, 0);
        }
        if (rail) {
          setProgress(rail, 0);
        }
      } else if (!isDragging) {
        updateFromScroll();
      }

      ticking = false;
    });
  }

  reducedMotion.addEventListener("change", scheduleUpdate);
  mobileQuery.addEventListener("change", scheduleUpdate);
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  scheduleUpdate();
})();
