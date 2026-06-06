(function () {
  const section = document.querySelector("#design");
  const pattern = section && section.querySelector(".design__pattern");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const MIN_VIEWPORT_COVERAGE = 2;
  const MAX_COPIES = 6;

  if (!section || !pattern) {
    return;
  }

  function createTextSpan(text, hidden) {
    const span = document.createElement("span");
    span.className = "design__pattern-row__text";
    span.textContent = text;

    if (hidden) {
      span.setAttribute("aria-hidden", "true");
    }

    return span;
  }

  function buildTrack(text) {
    const track = document.createElement("div");
    track.className = "design__pattern-row__track";
    track.appendChild(createTextSpan(text, false));
    track.appendChild(createTextSpan(text, true));
    return track;
  }

  function ensureCoverage(track) {
    const minWidth = window.innerWidth * MIN_VIEWPORT_COVERAGE;
    const first = track.querySelector(".design__pattern-row__text");

    if (!first) {
      return;
    }

    const text = first.textContent;
    let copies = track.querySelectorAll(".design__pattern-row__text").length;

    while (track.scrollWidth < minWidth && copies < MAX_COPIES) {
      track.appendChild(createTextSpan(text, true));
      copies += 1;
    }
  }

  function measureTrack(track) {
    const first = track.querySelector(".design__pattern-row__text");

    if (!first) {
      return;
    }

    const unit = Math.ceil(first.getBoundingClientRect().width);
    track.style.setProperty("--marquee-unit", unit + "px");
  }

  function setupRow(row) {
    let track = row.querySelector(".design__pattern-row__track");

    if (!track) {
      const text = row.textContent.trim();
      row.textContent = "";
      track = buildTrack(text);
      row.appendChild(track);
    }

    ensureCoverage(track);
    measureTrack(track);
  }

  function remeasureAll() {
    pattern.querySelectorAll(".design__pattern-row").forEach(function (row) {
      const track = row.querySelector(".design__pattern-row__track");

      if (!track) {
        setupRow(row);
        return;
      }

      ensureCoverage(track);
      measureTrack(track);
    });
  }

  pattern.querySelectorAll(".design__pattern-row").forEach(setupRow);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(remeasureAll);
  }

  let resizeTicking = false;

  window.addEventListener("resize", function () {
    if (resizeTicking) {
      return;
    }

    resizeTicking = true;

    requestAnimationFrame(function () {
      remeasureAll();
      resizeTicking = false;
    });
  });

  if (reducedMotion.matches) {
    return;
  }

  let inView = false;
  let isRunning = false;

  const observer = new IntersectionObserver(
    function (entries) {
      inView = entries[0].isIntersecting;

      if (!inView) {
        section.classList.remove("is-pattern-active");
        isRunning = false;
      }
    },
    { threshold: 0 },
  );

  observer.observe(section);

  window.addEventListener(
    "scroll",
    function () {
      if (!inView || isRunning) {
        return;
      }

      isRunning = true;
      section.classList.add("is-pattern-active");
    },
    { passive: true },
  );

  reducedMotion.addEventListener("change", function () {
    if (reducedMotion.matches) {
      section.classList.remove("is-pattern-active");
      isRunning = false;
      observer.disconnect();
    }
  });
})();
