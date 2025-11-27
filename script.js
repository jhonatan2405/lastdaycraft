// Pantalla de carga tipo "cargando mundo"
(function () {
  const loading = document.getElementById("loading-screen");
  const body = document.body;
  const percentEl = document.getElementById("loading-percent");
  const inner = document.querySelector(".loading-mc__inner");

  if (!loading || !percentEl || !inner) return;

  body.classList.add("is-loading");

  // Audio de fondo (música / ambiente zombi)
  const bgAudio = new Audio("audio/horror-box-149248.mp3");
  bgAudio.loop = true;
  bgAudio.volume = 0.35;

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
    bgAudio
      .play()
      .catch(() => {
        // Si el navegador bloquea la reproducción automática, no pasa nada.
      });
  }

  // Quitar loading automáticamente cuando termina la "carga"
  setTimeout(() => {
    finishLoading();
  }, duration + 800);
})();

// Partículas de fondo sencillas (polvo / chispas)
(function () {
  const canvas = document.getElementById("bg-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  const COUNT = 90;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
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

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      ctx.beginPath();
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
    links.classList.toggle("is-open");
  });

  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
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

  window.addEventListener("scroll", onScroll);
  onScroll();
})();

// Sonido leve al pasar el mouse sobre ciertos elementos
(function () {
  const hoverSoundSrc = "audio/pressing-a-computer-button.mp3";
  const interactiveSelectors = [
    ".btn",
    ".btn-github",
    ".nav__links a",
    ".mod-card",
    ".video-card",
  ];

  const elements = document.querySelectorAll(interactiveSelectors.join(", "));
  if (!elements.length) return;

  let lastPlay = 0;
  const hoverAudio = new Audio(hoverSoundSrc);
  hoverAudio.volume = 0.25;

  function playHoverSound() {
    const now = performance.now();
    if (now - lastPlay < 160) return;
    lastPlay = now;

    hoverAudio.currentTime = 0;
    hoverAudio.play().catch(() => {});
  }

  elements.forEach((el) => {
    el.addEventListener("mouseenter", playHoverSound);
  });
})();

// Animación flotante para el logo
(function () {
  const logo = document.querySelector(".hero__logo-img");
  if (!logo) return;

  logo.style.animation = "float 6s ease-in-out infinite";
})();

// Efecto de pulso en las pills del servidor
(function () {
  const accentPill = document.querySelector(".pill--accent");
  if (!accentPill) return;

  setInterval(() => {
    accentPill.style.animation = "pulse 1.5s ease-in-out";
    setTimeout(() => {
      accentPill.style.animation = "";
    }, 1500);
  }, 5000);
})();

// Efecto de glitch sutil en el título principal
(function () {
  const title = document.querySelector(".hero h1");
  if (!title) return;

  setInterval(() => {
    title.style.animation = "glitch 0.3s ease-in-out";
    setTimeout(() => {
      title.style.animation = "";
    }, 300);
  }, 8000);
})();

