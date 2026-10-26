/* =========================================================
   Mystique — layered parallax
   Panels scroll at normal speed (1×). Behind them:
     · satin backdrop  → slowest  (depth.satin)
     · silver glints   → mid      (depth.glints)
     · hero jewellery  → sits deeper inside the hero window (depth.hero)
     · photos marked data-inner drift gently inside their frames
   Everything is transform-only and batched in requestAnimationFrame.
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobile = window.matchMedia("(max-width: 760px)");

  var satin = document.querySelector(".scene__satin");
  var glints = document.querySelector(".scene__glints");
  var heroImg = document.querySelector(".hero__img");
  var hero = document.querySelector(".hero");
  var inners = Array.prototype.slice.call(document.querySelectorAll("[data-inner]"));

  // Speed of each layer relative to the page (1 = moves with the panels).
  function depths() {
    return mobile.matches
      ? { satin: 0.2, glints: 0.45 }
      : { satin: 0.28, glints: 0.58, heroTravel: 0.23, heroZoom: 0.12 };
  }
  var depth = depths();

  /* ---------- Silver glints (mid layer) ---------- */
  var SPARKLE = "M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z";
  function seeded(seed) {           // small deterministic PRNG so the layout is stable between loads
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }
  function buildGlints() {
    if (!glints) return;
    glints.textContent = "";
    var rand = seeded(7);
    var height = glints.offsetHeight || window.innerHeight * 3;
    var count = mobile.matches ? 10 : 22;
    var ns = "http://www.w3.org/2000/svg";
    for (var i = 0; i < count; i++) {
      var size = 7 + rand() * 13;
      var svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("class", "glint");
      svg.style.width = svg.style.height = size.toFixed(1) + "px";
      // keep glints to the outer thirds so they mostly sit in the gutters and behind glass edges
      var x = rand() < 0.5 ? rand() * 22 : 78 + rand() * 22;
      svg.style.left = x.toFixed(2) + "%";
      svg.style.top = (rand() * height).toFixed(0) + "px";
      svg.style.setProperty("--o", (0.45 + rand() * 0.45).toFixed(2));
      svg.style.animationDelay = (-rand() * 6).toFixed(2) + "s";
      svg.style.animationDuration = (4.5 + rand() * 4).toFixed(2) + "s";
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", SPARKLE);
      svg.appendChild(p);
      glints.appendChild(svg);
    }
  }

  /* ---------- Sizing ---------- */
  var maxScroll = 0;
  function measure() {
    depth = depths();
    maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
    var vh = window.innerHeight;
    if (satin) satin.style.height = Math.ceil(vh + maxScroll * depth.satin + 240) + "px";
    if (glints) glints.style.height = Math.ceil(vh + maxScroll * depth.glints + 240) + "px";
    buildGlints();
  }

  /* ---------- Per-frame update ---------- */
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    if (satin) satin.style.transform = "translate3d(0," + (-y * depth.satin).toFixed(2) + "px,0)";
    if (glints) glints.style.transform = "translate3d(0," + (-y * depth.glints).toFixed(2) + "px,0)";

    // hero jewellery: while the hero is on screen it lags behind its window
    if (heroImg && hero) {
      // progress 0 -> 1 while the hero scrolls out; the jewellery sinks and leans in
      var end = hero.offsetTop + hero.offsetHeight;
      var p = Math.min(Math.max(y / end, 0), 1);
      var travel = mobile.matches ? 46 : hero.offsetHeight * depth.heroTravel;
      var zoom = mobile.matches ? 0.08 : depth.heroZoom;
      heroImg.style.setProperty("--hp", (p * travel).toFixed(2) + "px");
      heroImg.style.setProperty("--hs", (1 + p * zoom).toFixed(4));
    }

    // photos inside frames drift a little against their frame
    for (var i = 0; i < inners.length; i++) {
      var el = inners[i];
      var frame = el.parentElement.getBoundingClientRect();
      if (frame.bottom < -100 || frame.top > vh + 100) continue;
      var k = parseFloat(el.getAttribute("data-inner")) || 0.1;
      var offset = (frame.top + frame.height / 2 - vh / 2) * k;
      el.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0)";
    }
  }
  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  /* ---------- Reveal panels as they enter ---------- */
  function tagContents(panel) {
    // the panel's own children, but step into list/grid wrappers so their items stagger too
    var groups = [".cats__list", ".cols__grid", ".panel__head"];
    var kids = [];
    Array.prototype.forEach.call(panel.children, function (child) {
      var isGroup = groups.some(function (g) { return child.matches(g); });
      if (isGroup) kids.push.apply(kids, child.children);
      else kids.push(child);
    });
    kids.forEach(function (el, i) {
      el.setAttribute("data-rv", "");
      el.style.setProperty("--rv", Math.min(i, 9));
    });
  }

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    for (var k = 0; k < items.length; k++) tagContents(items[k]);
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ---------- Save (heart) toggles ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".product__save");
    if (!btn) return;
    btn.setAttribute("aria-pressed", btn.getAttribute("aria-pressed") === "true" ? "false" : "true");
  });

  /* ---------- Start ---------- */
  function start() {
    setupReveal();
    if (reduceMotion.matches) {
      measure();
      return;                       // static backdrop, no parallax
    }
    measure();
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () { measure(); requestUpdate(); });
    window.addEventListener("load", function () { measure(); requestUpdate(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
