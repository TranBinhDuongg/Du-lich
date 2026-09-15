(() => {
  "use strict";
  const key = "tripmate.transition",
    pairs = [
      ["#023323", "#ccff90"],
      ["#ff4e58", "#ffe0b2"],
      ["#a9d7ed", "#023323"],
    ];

  const overlay = document.createElement("div");
  overlay.className = "page-transition";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="page-transition__shade"></div><div class="page-transition__bg"></div><div class="page-transition__logo">Tripmate<small>AI</small></div>';
  document.documentElement.append(overlay);
  let busy = false,
    timers = [],
    generation = 0;
  const later = (fn, ms) => {
    timers.push(setTimeout(fn, ms));
  };
  function colors(pair) {
    overlay.style.setProperty("--back", pair[0]);
    overlay.style.setProperty("--front", pair[1]);
  }
  function reset() {
    generation++;
    timers.forEach(clearTimeout);
    timers = [];
    busy = false;
    overlay.className = "page-transition";
  }
  let incoming;
  try {
    incoming = JSON.parse(sessionStorage.getItem(key));
    sessionStorage.removeItem(key);
  } catch {}
  window.TripMateNavigate = (href) => {
    if (busy) return;
    const target = new URL(href, location.href);
    if (target.origin !== location.origin) {
      location.assign(target.href);
      return;
    }
    busy = true;
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    colors(pair);
    overlay.className = "page-transition active";
    overlay.getBoundingClientRect();
    overlay.classList.add("shown");
    later(() => {
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({ pair, url: target.href, time: Date.now() }),
        );
      } catch {}
      location.assign(target.href);
    }, 1000);
  };
  document.addEventListener("click", (event) => {
    const a = event.target.closest("a[href]");
    if (
      !a ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      a.hasAttribute("download") ||
      (a.target && a.target !== "_self")
    )
      return;
    const target = new URL(a.href, location.href);
    if (
      target.origin !== location.origin ||
      !["http:", "https:", "file:"].includes(target.protocol) ||
      (target.pathname === location.pathname &&
        target.search === location.search)
    )
      return;
    event.preventDefault();
    window.TripMateNavigate(target.href);
  });
  if (
    incoming &&
    Date.now() - incoming.time < 15000 &&
    pairs.some((p) => JSON.stringify(p) === JSON.stringify(incoming.pair))
  ) {
    colors(incoming.pair);
    busy = true;
    overlay.className = "page-transition active shown frozen";
    const reveal = async () => {
      const token = generation;
      if (document.fonts)
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 350)),
        ]);
      if (token !== generation) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (token !== generation) return;
          overlay.classList.remove("frozen");
          overlay.getBoundingClientRect();
          overlay.classList.add("swapped");
          later(() => {
            overlay.classList.remove("shown");
            overlay.classList.add("exiting");
          }, 600);
          later(reset, 1250);
        }),
      );
    };
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", reveal, { once: true });
    else reveal();
  }
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) reset();
  });
})();
