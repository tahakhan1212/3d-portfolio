/* =============================================
   TAHA SULTAN — Developer Portfolio
   Cinematic Scroll Engine
   ============================================= */

(function () {
  "use strict";

  // ---- Configuration ----
  var HERO_FRAME_COUNT = 169;
  var CINE_FRAME_COUNT = 169;

  function heroFramePath(n) {
    return "public/frames/frame_" + String(n).padStart(4, "0") + ".jpg";
  }
  function cineFramePath(n) {
    return "public/frames2/frame_" + String(n).padStart(4, "0") + ".jpg";
  }

  // ---- Lenis Smooth Scroll ----
  var lenis = new Lenis({
    lerp: 0.1,
    duration: 1.2,
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1.1,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ---- Navbar Scroll Effect ----
  var navbar = document.getElementById("navbar");
  function onScrollNavbar() {
    if (window.scrollY > 40) {
      navbar.style.backgroundColor = "rgba(0,0,0,0.6)";
      navbar.style.backdropFilter = "blur(24px) saturate(150%)";
      navbar.style.webkitBackdropFilter = "blur(24px) saturate(150%)";
      navbar.style.borderBottomColor = "rgba(255,255,255,0.1)";
    } else {
      navbar.style.backgroundColor = "transparent";
      navbar.style.backdropFilter = "none";
      navbar.style.webkitBackdropFilter = "none";
      navbar.style.borderBottomColor = "transparent";
    }
  }
  window.addEventListener("scroll", onScrollNavbar, { passive: true });
  onScrollNavbar();

  // ---- Canvas Utilities ----
  function createFrameLoader(count, pathFn, onProgress, onDone) {
    var loadedCount = 0;
    var imgs = [];
    for (var i = 1; i <= count; i++) {
      var img = new Image();
      img.src = pathFn(i);
      img.onload = img.onerror = function () {
        loadedCount++;
        onProgress(loadedCount / count);
        if (loadedCount === count) onDone(imgs);
      };
      imgs.push(img);
    }
    return imgs;
  }

  function drawFrameOnCanvas(canvas, img) {
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var cw = canvas.width, ch = canvas.height;
    var imgRatio = img.naturalWidth / img.naturalHeight;
    var canvasRatio = cw / ch;
    var drawW, drawH;
    if (canvasRatio > imgRatio) { drawW = cw; drawH = cw / imgRatio; }
    else { drawH = ch; drawW = ch * imgRatio; }
    if (window.innerWidth <= 768) { drawW *= 1.3; drawH *= 1.3; }
    var drawX = (cw - drawW) / 2;
    var drawY = (ch - drawH) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  function resizeCanvasToWindow(canvas) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  // ---- Staggered Reveal Utility ----
  function revealWithStagger(container, progress, startAt, duration) {
    var relProg = Math.min(1, Math.max(0, (progress - startAt) / duration));
    container.style.opacity = String(relProg);
    container.style.transform = "translateY(" + (1 - relProg) * 12 + "px)";

    var items = container.querySelectorAll("[data-delay]");
    for (var i = 0; i < items.length; i++) {
      var delay = parseInt(items[i].getAttribute("data-delay")) || 0;
      var itemStart = startAt + (delay / 1000) * 0.15;
      var itemProg = Math.min(1, Math.max(0, (progress - itemStart) / 0.06));
      items[i].style.opacity = String(itemProg);
      items[i].style.transform = "translateY(" + (1 - itemProg) * 10 + "px)";
    }
  }

  function hideGroup(container) {
    container.style.opacity = "0";
    container.style.transform = "translateY(12px)";
    var items = container.querySelectorAll("[data-delay]");
    for (var i = 0; i < items.length; i++) {
      items[i].style.opacity = "0";
      items[i].style.transform = "translateY(10px)";
    }
  }

  // =============================================
  // FRAME 1 — Hero Introduction
  // =============================================
  (function initHero() {
    var section = document.getElementById("frame1");
    var canvas = document.getElementById("hero-canvas");
    var heroText = document.getElementById("hero-text");
    var bigCenter = document.getElementById("hero-big-center");
    var techModules = document.getElementById("hero-tech-modules");
    var missions = document.getElementById("hero-missions");
    var heroStats = document.getElementById("hero-stats");
    var sysCards = document.getElementById("sys-cards");
    var devLogs1 = document.getElementById("dev-logs-1");
    var progressFill = document.getElementById("hero-progress");
    var loadingScreen = document.getElementById("hero-loading");
    var loadBar = document.getElementById("hero-load-bar");
    var loadText = document.getElementById("hero-load-text");

    var frames = [];
    var loaded = false;
    var lastFrame = -1;
    var ticking = false;

    resizeCanvasToWindow(canvas);
    window.addEventListener("resize", function () {
      resizeCanvasToWindow(canvas);
      if (lastFrame >= 0 && frames[lastFrame]) drawFrameOnCanvas(canvas, frames[lastFrame]);
    });

    frames = createFrameLoader(HERO_FRAME_COUNT, heroFramePath,
      function (pct) {
        var p = Math.round(pct * 100);
        if (loadBar) loadBar.style.width = p + "%";
        if (loadText) loadText.textContent = "Loading Developer Profile \u00a0\u00b7\u00a0 " + p + "%";
      },
      function (imgs) {
        loaded = true;
        drawFrameOnCanvas(canvas, imgs[0]);
        lastFrame = 0;
        if (loadingScreen) loadingScreen.style.display = "none";
      }
    );

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (!loaded) return;

        var rect = section.getBoundingClientRect();
        var scrollable = section.offsetHeight - window.innerHeight;
        var p = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));

        // Canvas frame
        var fi = Math.min(HERO_FRAME_COUNT - 1, Math.floor(p * HERO_FRAME_COUNT));
        if (fi !== lastFrame) { lastFrame = fi; drawFrameOnCanvas(canvas, frames[fi]); }

        // Progress bar
        if (progressFill) progressFill.style.transform = "scaleX(" + p + ")";

        // === SCENE A: Hero Text (0 - 0.12) ===
        if (heroText) {
          var heroOp = Math.min(1, Math.max(0, 1 - p / 0.1));
          heroText.style.opacity = String(heroOp);
          heroText.style.transform = "translateY(" + (1 - heroOp) * 15 + "px)";
        }

        // === System Cards (0.02 - 0.35) ===
        if (sysCards) {
          if (p > 0.02 && p < 0.35) {
            revealWithStagger(sysCards, p, 0.02, 0.1);
          } else {
            hideGroup(sysCards);
          }
        }

        // === Developer Logs 1 (0.05 - 0.4) ===
        if (devLogs1) {
          if (p > 0.05 && p < 0.4) {
            revealWithStagger(devLogs1, p, 0.05, 0.08);
          } else {
            hideGroup(devLogs1);
          }
        }

        // === SCENE B: Big Center Headline (0.12 - 0.4) ===
        if (bigCenter) {
          if (p > 0.12 && p < 0.4) {
            var bcProg = Math.min(1, Math.max(0, (p - 0.12) / 0.08));
            bigCenter.style.opacity = String(bcProg);
            bigCenter.style.transform = "translateY(" + (1 - bcProg) * 15 + "px)";
          } else if (p >= 0.4) {
            var bcOut = Math.max(0, 1 - (p - 0.35) / 0.05);
            bigCenter.style.opacity = String(bcOut);
          } else {
            bigCenter.style.opacity = "0";
          }
        }

        // === SCENE C: Tech Modules (0.35 - 0.65) ===
        if (techModules) {
          if (p > 0.35 && p < 0.65) {
            revealWithStagger(techModules, p, 0.35, 0.1);
          } else {
            hideGroup(techModules);
          }
        }

        // === SCENE D: Mission Logs (0.45 - 0.8) ===
        if (missions) {
          if (p > 0.45 && p < 0.8) {
            revealWithStagger(missions, p, 0.45, 0.1);
          } else {
            hideGroup(missions);
          }
        }

        // === Stats (0.55 - 0.9) ===
        if (heroStats) {
          if (p > 0.55 && p < 0.9) {
            revealWithStagger(heroStats, p, 0.55, 0.08);
          } else {
            hideGroup(heroStats);
          }
        }
      });
    }, { passive: true });
  })();

  // =============================================
  // FRAME 2 — Developer Profile / J.A.R.V.I.S.
  // =============================================
  (function initCinematic() {
    var section = document.getElementById("frame2");
    var canvas = document.getElementById("cine-canvas");
    var techModules = document.getElementById("tech-modules");
    var archives = document.getElementById("archives");
    var achievements = document.getElementById("achievements");
    var frame2Stats = document.getElementById("frame2-stats");
    var finalScene = document.getElementById("final-scene");
    var devLogs2 = document.getElementById("dev-logs-2");
    var progressFill = document.getElementById("cine-progress");
    var seqReadout = document.getElementById("cine-seq");
    var loadingScreen = document.getElementById("cine-loading");
    var loadBar = document.getElementById("cine-load-bar");
    var loadText = document.getElementById("cine-load-text");

    var frames = [];
    var loaded = false;
    var lastFrame = -1;
    var ticking = false;

    if (!section || !canvas) return;

    resizeCanvasToWindow(canvas);
    window.addEventListener("resize", function () {
      resizeCanvasToWindow(canvas);
      if (lastFrame >= 0 && frames[lastFrame]) drawFrameOnCanvas(canvas, frames[lastFrame]);
    });

    frames = createFrameLoader(CINE_FRAME_COUNT, cineFramePath,
      function (pct) {
        var p = Math.round(pct * 100);
        if (loadBar) loadBar.style.width = p + "%";
        if (loadText) loadText.textContent = "Accessing Profile \u00a0\u00b7\u00a0 " + p + "%";
      },
      function (imgs) {
        loaded = true;
        drawFrameOnCanvas(canvas, imgs[0]);
        lastFrame = 0;
        if (loadingScreen) loadingScreen.style.display = "none";
      }
    );

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (!loaded) return;

        var rect = section.getBoundingClientRect();
        var scrollable = section.offsetHeight - window.innerHeight;
        var p = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));

        // Canvas frame
        var fi = Math.min(CINE_FRAME_COUNT - 1, Math.floor(p * CINE_FRAME_COUNT));
        if (fi !== lastFrame) { lastFrame = fi; drawFrameOnCanvas(canvas, frames[fi]); }

        // Progress bar
        if (progressFill) progressFill.style.transform = "scaleX(" + p + ")";

        // Seq readout
        if (seqReadout) {
          var n = Math.min(CINE_FRAME_COUNT, fi + 1);
          seqReadout.textContent = "SEQ " + String(n).padStart(3, "0") + " / " + CINE_FRAME_COUNT;
        }

        // === SCENE E: Technology System Modules (0 - 0.25) ===
        if (techModules) {
          if (p > 0.0 && p < 0.25) {
            revealWithStagger(techModules, p, 0.0, 0.08);
          } else {
            hideGroup(techModules);
          }
        }

        // === Developer Logs 2 (0.05 - 0.35) ===
        if (devLogs2) {
          if (p > 0.05 && p < 0.35) {
            revealWithStagger(devLogs2, p, 0.05, 0.08);
          } else {
            hideGroup(devLogs2);
          }
        }

        // === SCENE F: Archives (0.2 - 0.5) ===
        if (archives) {
          if (p > 0.2 && p < 0.5) {
            revealWithStagger(archives, p, 0.2, 0.08);
          } else {
            hideGroup(archives);
          }
        }

        // === SCENE G: Achievements + Stats (0.4 - 0.7) ===
        if (achievements) {
          if (p > 0.4 && p < 0.7) {
            revealWithStagger(achievements, p, 0.4, 0.08);
          } else {
            hideGroup(achievements);
          }
        }
        if (frame2Stats) {
          if (p > 0.42 && p < 0.7) {
            revealWithStagger(frame2Stats, p, 0.42, 0.08);
          } else {
            hideGroup(frame2Stats);
          }
        }

        // === SCENE H: Final Scene (0.72 - 1.0) ===
        if (finalScene) {
          if (p > 0.72) {
            var fProg = Math.min(1, Math.max(0, (p - 0.72) / 0.1));
            finalScene.style.opacity = String(fProg);
          } else {
            finalScene.style.opacity = "0";
          }
        }
      });
    }, { passive: true });
  })();

  // ---- Mouse Parallax on System Modules ----
  document.addEventListener("mousemove", function (e) {
    var mods = document.querySelectorAll(".system-module");
    var cx = e.clientX / window.innerWidth - 0.5;
    var cy = e.clientY / window.innerHeight - 0.5;
    for (var i = 0; i < mods.length; i++) {
      var depth = (i % 3 + 1) * 0.3;
      mods[i].style.transform = "translate(" + (cx * depth * 2) + "px, " + (cy * depth * 2) + "px)";
    }
  });

  // ---- Random HUD Flicker on Sys Cards ----
  setInterval(function () {
    var cards = document.querySelectorAll(".sys-card");
    if (cards.length === 0) return;
    var idx = Math.floor(Math.random() * cards.length);
    cards[idx].style.opacity = "0.5";
    setTimeout(function () { cards[idx].style.opacity = "1"; }, 80);
    setTimeout(function () {
      cards[idx].style.opacity = "0.7";
      setTimeout(function () { cards[idx].style.opacity = "1"; }, 60);
    }, 150);
  }, 4000);

})();
