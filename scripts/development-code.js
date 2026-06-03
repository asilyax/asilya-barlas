(function () {
  const block = document.querySelector('[data-animate="code-typing"]');
  const code = block?.querySelector(".development__code");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const CHAR_CLASS = "development__code-char";
  const VISIBLE_CLASS = "is-code-char-visible";
  const CURSOR_CLASS = "is-code-char-cursor";
  const DURATION_MS = 3000;

  if (!block || !code) {
    return;
  }

  let hasPlayed = false;
  let cursorChar = null;
  let rafId = 0;

  function wrapTextNodes(root) {
    if (code.dataset.charsWrapped === "true") {
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(function (node) {
      const text = node.textContent;

      if (!text) {
        return;
      }

      const frag = document.createDocumentFragment();

      for (const ch of text) {
        const span = document.createElement("span");
        span.className = CHAR_CLASS;
        span.textContent = ch;
        frag.appendChild(span);
      }

      node.parentNode.replaceChild(frag, node);
    });

    code.dataset.charsWrapped = "true";
    block.style.minWidth = block.offsetWidth + "px";
  }

  function getChars() {
    return [...code.querySelectorAll("." + CHAR_CLASS)].filter(function (el) {
      return el.getClientRects().length > 0;
    });
  }

  function setCursor(char) {
    if (cursorChar) {
      cursorChar.classList.remove(CURSOR_CLASS);
    }

    cursorChar = char || null;

    if (cursorChar) {
      cursorChar.classList.add(CURSOR_CLASS);
    }
  }

  function revealAll() {
    code.querySelectorAll("." + CHAR_CLASS).forEach(function (char) {
      char.classList.add(VISIBLE_CLASS);
    });
    setCursor(null);
    block.classList.add("is-code-typing-complete");
    block.classList.remove("is-code-typing--active");
  }

  function playTyping() {
    if (hasPlayed) {
      return;
    }

    hasPlayed = true;

    const chars = getChars();

    if (!chars.length) {
      block.classList.add("is-code-typing-complete");
      return;
    }

    block.classList.add("is-code-typing--active");

    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const targetCount = Math.max(1, Math.ceil(progress * chars.length));

      for (let i = 0; i < targetCount; i++) {
        chars[i].classList.add(VISIBLE_CLASS);
      }

      setCursor(chars[targetCount - 1]);

      if (progress >= 1) {
        for (let i = 0; i < chars.length; i++) {
          chars[i].classList.add(VISIBLE_CLASS);
        }

        setCursor(null);
        block.classList.add("is-code-typing-complete");
        block.classList.remove("is-code-typing--active");
        return;
      }

      rafId = requestAnimationFrame(frame);
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(frame);
  }

  wrapTextNodes(code);
  block.classList.add("is-code-typing");

  if (reducedMotion.matches) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      if (!entries[0].isIntersecting) {
        return;
      }

      observer.disconnect();
      playTyping();
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  observer.observe(block);
})();
