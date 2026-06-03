(function () {
  const timeline = document.querySelector(".process__timeline");
  const rail = document.querySelector(".process__rail");
  const desktopIndicator = document.querySelector(".process__indicator");
  const railIndicator = document.querySelector(".process__rail-indicator");
  const mobileQuery = window.matchMedia("(max-width: 640px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SMOOTHING = 0.22;

  if (!timeline && !rail) {
    return;
  }

  let isDragging = false;
  let activeIndicator = null;
  let displayProgress = 0;
  let targetProgress = 0;
  let animationFrameId = 0;

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

  function trackHeight(trackEl) {
    return trackEl.offsetHeight || trackEl.getBoundingClientRect().height || 0;
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

  function applyProgress(container, progress) {
    const trackInfo = getTrack();
    const track =
      trackInfo && trackInfo.container === container
        ? trackInfo.track
        : container === timeline
          ? timeline
          : rail;
    const height = track ? trackHeight(track) : 0;

    container.style.setProperty("--process-progress", String(progress));
    container.style.setProperty("--process-progress-y", progress * height + "px");
  }

  function setProgressImmediate(container, progress) {
    displayProgress = progress;
    targetProgress = progress;
    applyProgress(container, progress);
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

  function animationStep() {
    animationFrameId = 0;

    if (reducedMotion.matches) {
      displayProgress = 0;
      targetProgress = 0;

      if (timeline) {
        applyProgress(timeline, 0);
      }

      if (rail) {
        applyProgress(rail, 0);
      }

      return;
    }

    if (isDragging) {
      return;
    }

    const trackInfo = getTrack();

    if (!trackInfo) {
      return;
    }

    targetProgress = progressFromScroll(trackInfo.track);

    const delta = targetProgress - displayProgress;

    if (Math.abs(delta) > 0.0008) {
      displayProgress += delta * SMOOTHING;
    } else {
      displayProgress = targetProgress;
    }

    applyProgress(trackInfo.container, displayProgress);

    if (Math.abs(targetProgress - displayProgress) > 0.0008) {
      animationFrameId = requestAnimationFrame(animationStep);
    }
  }

  function requestAnimation() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animationStep);
    }
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
      setProgressImmediate(container, progress);
      scrollForProgress(progress);
    });

    indicator.addEventListener("pointermove", function (event) {
      if (!isDragging || activeIndicator !== indicator) {
        return;
      }

      const progress = progressFromClientY(track, event.clientY);
      setProgressImmediate(container, progress);
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

      requestAnimation();
    }

    indicator.addEventListener("pointerup", endDrag);
    indicator.addEventListener("pointercancel", endDrag);
  }

  bindDrag(desktopIndicator, timeline, timeline);
  bindDrag(railIndicator, rail, rail);

  function scheduleUpdate() {
    if (reducedMotion.matches) {
      animationStep();
      return;
    }

    if (!isDragging) {
      const trackInfo = getTrack();

      if (trackInfo) {
        targetProgress = progressFromScroll(trackInfo.track);
      }
    }

    requestAnimation();
  }

  reducedMotion.addEventListener("change", scheduleUpdate);
  mobileQuery.addEventListener("change", scheduleUpdate);
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  scheduleUpdate();
})();
