// Pantalla de carga tipo "cargando mundo"
(function () {
  const loading = document.getElementById("loading-screen");
  const body = document.body;
  const percentEl = document.getElementById("loading-percent");
  const inner = document.querySelector(".loading-mc__inner");

  if (!loading || !percentEl || !inner) return;

  body.classList.add("is-loading");

  // Background audio: defer heavy resource loading until necessary
  // Do not create or preload on low-end devices or mobile to save network/CPU.
  let bgAudio = null;
  function createBgAudio() {
    if (bgAudio) return bgAudio;
    bgAudio = new Audio("audio/horror-box-149248.mp3");
    bgAudio.loop = true;
    bgAudio.volume = 0.35;
    // Defer loading until user interaction or desktop set
    bgAudio.preload = "none";
    return bgAudio;
  }
  let bgAudioStarted = false;

  // Crear bloques tipo "chunk" dentro del cuadrado
  const blocks = [];
  const totalBlocks = 100;
  for (let i = 0; i < totalBlocks; i++) {
    const block = document.createElement("div");
    block.className = "loading-mc__block";
    inner.appendChild(block);
    blocks.push(block);
  }

  // Simular porcentaje de carga 0% -> 100%
  let progress = 0;
  const duration = 2500; // ms, más rápido
  const start = performance.now();

  function updateProgress(now) {
    const elapsed = now - start;
    progress = Math.min(1, elapsed / duration);
    const percent = Math.round(progress * 100);
    percentEl.textContent = `${percent}%`;

    // Mostrar bloques en función del progreso para simular generación
    const visibleBlocks = Math.floor(progress * totalBlocks);
    for (let i = 0; i < visibleBlocks; i++) {
      if (!blocks[i].classList.contains("is-visible")) {
        blocks[i].classList.add("is-visible");
      }
    }

    if (progress < 1) {
      requestAnimationFrame(updateProgress);
    }
  }

  requestAnimationFrame(updateProgress);

  function finishLoading() {
    if (loading.classList.contains("is-hidden")) return;
    loading.classList.add("is-hidden");
    body.classList.remove("is-loading");

    // Animación suave de aparición del contenido
    body.classList.add("is-ready");

    // Intentar reproducir audio (puede requerir interacción previa del usuario)
    // Si el navegador bloquea la reproducción automática, añadimos un fallback
    // para comenzar la reproducción en la primera interacción del usuario.
    function tryPlayBgAudio() {
        if (bgAudioStarted) return;
        const aud = createBgAudio();

        // Try playing directly (may still be blocked on some browsers)
        aud
          .play()
          .then(() => {
            bgAudioStarted = true;
            console.log("bgAudio reproduciéndose automáticamente");
          })
          .catch((err) => {
            console.warn("Reproducción automática con sonido bloqueada:", err);
            // Intento 2: reproducir en modo silenciado (esto suele permitirse) para "desbloquear"
            aud.muted = true;
            aud
              .play()
              .then(() => {
                bgAudioStarted = true;
                console.log("bgAudio reproducido en modo silenciado (fallback)" );
                // Mostrar overlay pidiendo activar sonido
                showEnableOverlay();
              })
              .catch((errMuted) => {
                console.warn("Reproducción en modo silencioso también falló:", errMuted);
                // Mostrar overlay pidiendo activar sonido
                showEnableOverlay();
              });
          });
      }

    tryPlayBgAudio();

    // Control de reproducción visible para el usuario
    const audioToggle = document.getElementById("audio-toggle");
    // Overlay y botón de activación para el audio en caso de bloqueo
    const overlay = document.getElementById("audio-enable-overlay");
    const overlayBtn = document.getElementById("audio-enable-btn");

    function showEnableOverlay() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
        overlay.setAttribute("aria-hidden", "false");
      }
    }

    function hideEnableOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
        overlay.setAttribute("aria-hidden", "true");
      }
    }

    if (overlayBtn) {
      overlayBtn.addEventListener("click", () => {
        // Al hacer click en el overlay intentamos reproducir con sonido y desbloquear
          const aud = createBgAudio();
          aud.muted = false;
          aud.volume = 0.35;
          aud
          .play()
          .then(() => {
            bgAudioStarted = true;
            hideEnableOverlay();
            localStorage.setItem("ldc-audio-enabled", "true");
          })
          .catch((err) => {
            console.warn("Error al intentar activar el audio desde el overlay:", err);
          });
      });
    }

    if (audioToggle) {
      // Estado inicial
      audioToggle.textContent = "🔈"; // no suena todavía

      // Update UI when playback begins (wire events once on the created audio)
      const aud = createBgAudio();
      aud.addEventListener("play", () => {
        audioToggle.textContent = "🔊";
      });

      aud.addEventListener("pause", () => {
        audioToggle.textContent = "🔈";
      });

      audioToggle.addEventListener("click", () => {
        if (!bgAudioStarted) {
          // Try to create and play the audio if not yet started
          tryPlayBgAudio();
          return;
        }
        const aud = createBgAudio();
        if (aud.paused) {
          aud
            .play()
            .then(() => {
              audioToggle.textContent = "🔊";
            })
            .catch(() => {});
        } else {
            aud.pause();
          audioToggle.textContent = "🔈";
        }
      });
    }
  }

  // Quitar loading automáticamente cuando termina la "carga"
  setTimeout(() => {
    finishLoading();
  }, duration + 800);

  // ===== Image/Lazy prefetching & IntersectionObserver =====
  // Prefetch images during the loading screen for capable devices.
  function shouldPrefetch() {
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const deviceMemory = navigator.deviceMemory || 4;
    const effectiveType = (navigator.connection && navigator.connection.effectiveType) || '4g';
    // Avoid prefetch on 2g/slow networks or low-memory devices
    if (isCoarse || deviceMemory <= 1) return false;
    if (effectiveType && (effectiveType === '2g' || effectiveType === 'slow-2g')) return false;
    return true;
  }

  const lazyImgs = Array.from(document.querySelectorAll('img.lazy'));
  const ioOptions = { root: null, rootMargin: '600px 0px 600px 0px', threshold: 0 };
  const imgObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src && img.src !== src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
        }
        imgObserver.unobserve(img);
      }
    }
  }, ioOptions);

  lazyImgs.forEach((img) => imgObserver.observe(img));

  // Prefetch images marked with data-prefetch=true only during load and only on capable devices
  if (shouldPrefetch()) {
    const prefetchImgs = Array.from(document.querySelectorAll('img[data-prefetch="true"]'));
    prefetchImgs.forEach((img) => {
      const src = img.getAttribute('data-src') || img.src;
      const i = new Image();
      i.src = src; // browser will cache it
      i.onload = () => {
        // nothing, cached
      };
    });
  }
})();

// Panel de estado y métricas (usa proxy /api para no exponer el token)
(function () {
  const serverPanel = document.querySelector('.server-panel');
  if (!serverPanel) return;

  const serverId = serverPanel.dataset.server || '';
  // Optional API base override stored as data attribute in HTML
  const apiAttr = serverPanel.dataset.api || '';
  if (apiAttr) window.LDC_API_BASE = apiAttr;
  const ipEl = serverPanel.querySelector('.server-ip');
  const statusEl = serverPanel.querySelector('.server-status-badge');
  const playersEl = serverPanel.querySelector('.server-players');
  const versionEl = serverPanel.querySelector('.server-version');
  const metricMemory = document.getElementById('metric-memory');
  const metricTick = document.getElementById('metric-tick');
  const metricRamAssigned = document.getElementById('metric-ram-assigned');
  const exportPlayersBtn = document.getElementById('export-players');

  function mapStatus(code) {
    switch (code) {
      case 0: return 'OFFLINE';
      case 1: return 'ONLINE';
      case 2: return 'STARTING';
      case 3: return 'STOPPING';
      case 4: return 'RESTARTING';
      case 6: return 'LOADING';
      default: return 'UNKNOWN';
    }
  }

  const API_BASE = window.LDC_API_BASE || '/api';
  async function apiGet(path) {
    try {
      const res = await fetch(`${API_BASE}${path}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API GET error', path, err);
      throw err;
    }
  }

  async function fetchServer() {
    if (!serverId) return;
    try {
      const data = await apiGet(`/servers/${encodeURIComponent(serverId)}`);
      // Update UI
      if (ipEl) ipEl.textContent = data.address || `${data.host}:${data.port}` || 'N/A';
      if (statusEl) statusEl.textContent = mapStatus(data.status);
      if (playersEl) playersEl.textContent = `${data.players.count}/${data.players.max}`;
      if (versionEl) versionEl.textContent = `${data.software.name} ${data.software.version}`;

      // Export players btn enable if list available
      if (exportPlayersBtn) exportPlayersBtn.disabled = !Array.isArray(data.players.list) || data.players.list.length === 0;
    } catch (err) {
      if (statusEl) statusEl.textContent = 'ERROR';
    }
  }

  async function fetchRamOption() {
    if (!serverId) return;
    try {
      const data = await apiGet(`/servers/${encodeURIComponent(serverId)}/options/ram/`);
      if (metricRamAssigned) metricRamAssigned.textContent = (data && data.current) ? `${data.current} MB` : 'N/D';
      // Metrics such as memory usage / tick require websocket; indicate fallback
      if (metricMemory && metricMemory.textContent === '--') metricMemory.textContent = 'Habilitar websocket';
      if (metricTick && metricTick.textContent === '--') metricTick.textContent = 'Habilitar websocket';
    } catch (err) {
      if (metricRamAssigned) metricRamAssigned.textContent = 'N/D';
    }
  }

  // Export players list to CSV
  if (exportPlayersBtn) {
    exportPlayersBtn.addEventListener('click', async () => {
      if (!serverId) return alert('Server ID no configurado');
      try {
        const data = await apiGet(`/servers/${encodeURIComponent(serverId)}`);
        const players = (data.players && Array.isArray(data.players.list)) ? data.players.list : [];
        if (!players.length) return alert('No hay jugadores conectados para exportar');

        const csv = players.map(name => `${name}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `players-${serverId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('Error exportando jugadores');
      }
    });
  }

  // Basic polling
  fetchServer();
  fetchRamOption();
  setInterval(fetchServer, 15000);
  setInterval(fetchRamOption, 60000);
})();

// Partículas de fondo sencillas (polvo / chispas)
(function () {
  const canvas = document.getElementById("bg-particles");
  if (!canvas) return;

  // Determine device capacity and bail out for low end devices to avoid CPU/GPU strain
  const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const deviceMemory = navigator.deviceMemory || 4;
  const cpuCount = navigator.hardwareConcurrency || 4;
  const isLowEnd = isCoarsePointer || deviceMemory <= 1 || cpuCount <= 2;
  if (isLowEnd) {
    // Optionally remove canvas from DOM to free resources
    // canvas.remove(); // Uncomment if you want to remove it outright
    return;
  }

  const ctx = canvas.getContext("2d");
  let particles = [];
  // On capable devices we use a higher particle count
  const COUNT = 90;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Debounce resize event to avoid frequent reflows on mobile
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 160);
  });
  resize();

  function createParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        speedY: Math.random() * 0.15 + 0.05,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }
  }
  const useGradients = true;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      ctx.beginPath();
      if (useGradients) {
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.r * 3
        );
        gradient.addColorStop(0, `rgba(243,165,71,${p.alpha})`);
        gradient.addColorStop(1, "rgba(243,165,71,0)");
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(243,165,71,${Math.min(1,p.alpha)})`;
        ctx.fillRect(p.x, p.y, Math.round(p.r + 1), Math.round(p.r + 1));
      }

      p.y += p.speedY;
      if (p.y - p.r * 3 > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    }

    requestAnimationFrame(loop);
  }

  createParticles();
  loop();
})();

// Filtro de mods por categoría
(function () {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".mod-card"));
  if (!chips.length || !cards.length) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.getAttribute("data-filter");
      chips.forEach((c) => c.classList.remove("chip--active"));
      chip.classList.add("chip--active");

      cards.forEach((card) => {
        const cats = card
          .getAttribute("data-category")
          .toLowerCase()
          .split(/\s+/);
        const shouldShow = filter === "all" || cats.includes(filter);
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
})();

// Menú responsive
(function () {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Botón volver arriba + año automático
(function () {
  const backToTop = document.querySelector(".back-to-top");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (!backToTop) return;

  function onScroll() {
    if (window.scrollY > 260) {
      backToTop.classList.remove("is-hidden");
    } else {
      backToTop.classList.add("is-hidden");
    }
  }

  // Use passive scroll listener for smoother scrolling on mobile
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// Sonido leve al pasar el mouse sobre ciertos elementos (solo para dispositivos con pointer: fine)
(function () {
  const interactiveSelectors = [
    ".btn",
    ".btn-github",
    ".nav__links a",
    ".mod-card",
    ".video-card",
  ];

  const isPointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!isPointerFine) return; // Skip hover sounds on touch devices

  const elements = document.querySelectorAll(interactiveSelectors.join(", "));
  if (!elements.length) return;

  let lastPlay = 0;
  let hoverAudio = null;

  function ensureHoverAudio() {
    if (hoverAudio) return hoverAudio;
    hoverAudio = new Audio("audio/pressing-a-computer-button.mp3");
    hoverAudio.volume = 0.25;
    hoverAudio.preload = 'none';
    return hoverAudio;
  }

  function playHoverSound() {
    const now = performance.now();
    if (now - lastPlay < 160) return;
    lastPlay = now;

    const a = ensureHoverAudio();
    a.currentTime = 0;
    a.play().catch(() => {});
  }

  elements.forEach((el) => {
    el.addEventListener("mouseenter", playHoverSound);
  });
})();

// Animación flotante para el logo
(function () {
  const logo = document.querySelector(".hero__logo-img");
  if (!logo) return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  const shouldAnimateLogo = !prefersReduced && pointerFine;
  if (shouldAnimateLogo) {
    logo.style.animation = "float 6s ease-in-out infinite";
  }
})();

// Efecto de pulso en las pills del servidor
(function () {
  const accentPill = document.querySelector(".pill--accent");
  if (!accentPill) return;
  // Only animate if user doesn't prefer reduced motion and pointer is fine
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!prefersReduced && pointerFine) {
    setInterval(() => {
      accentPill.style.animation = "pulse 1.5s ease-in-out";
      setTimeout(() => {
        accentPill.style.animation = "";
      }, 1500);
    }, 5000);
  }
})();

// Efecto de glitch sutil en el título principal
(function () {
  const title = document.querySelector(".hero h1");
  if (!title) return;
  const prefersReduced2 = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine2 = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!prefersReduced2 && pointerFine2) {
    setInterval(() => {
      title.style.animation = "glitch 0.3s ease-in-out";
      setTimeout(() => {
        title.style.animation = "";
      }, 300);
    }, 8000);
  }
})();

