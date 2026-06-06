(function () {
  const section = document.querySelector("#process");
  const items = document.querySelectorAll('[data-animate="process-item"]');
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!section || !items.length) {
    return;
  }

  if (reducedMotion.matches) {
    items.forEach(function (item) {
      item.classList.add("is-process-visible");
    });
    return;
  }

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting) {
        return;
      }

      items.forEach(function (item) {
        item.classList.remove("is-process-visible");
      });
    },
    { threshold: 0 },
  );

  const itemObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-process-visible");
        } else {
          entry.target.classList.remove("is-process-visible");
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
  );

  sectionObserver.observe(section);

  items.forEach(function (item) {
    itemObserver.observe(item);
  });

  reducedMotion.addEventListener("change", function () {
    if (!reducedMotion.matches) {
      return;
    }

    sectionObserver.disconnect();
    itemObserver.disconnect();
    items.forEach(function (item) {
      item.classList.add("is-process-visible");
    });
  });
})();
