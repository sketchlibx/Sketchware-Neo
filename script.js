(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const footerTheme = document.getElementById("footerTheme");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const progress = document.getElementById("scrollProgress");
  const topbar = document.getElementById("topbar");

  const screenshotBase = "assets/screenshots";
  const themeFolder = theme => theme === "light" ? "light" : "night";
  const themeImage = (name, theme = root.dataset.theme) => `${screenshotBase}/${themeFolder(theme)}/${name}.jpg`;

  const updateThemeImages = theme => {
    document.querySelectorAll("img[data-shot]").forEach(img => {
      const name = img.dataset.shot;
      if (!name) return;
      const next = themeImage(name, theme);
      if (img.dataset.currentSrc === next) return;
      img.dataset.currentSrc = next;
      img.src = next;
    });
  };

  const preloadTheme = theme => {
    ["projects", "cloud-manage", "native-editor", "gradle-manager", "native-tools", "terminal", "editor"].forEach(name => {
      const image = new Image();
      image.src = themeImage(name, theme);
    });
  };

  const setTheme = theme => {
    root.dataset.theme = theme;
    try { localStorage.setItem("neo-theme", theme); } catch (_) {}
    const light = theme === "light";
    themeIcon.textContent = light ? "dark_mode" : "light_mode";
    themeToggle?.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    updateThemeImages(theme);
    preloadTheme(light ? "dark" : "light");
  };

  const toggleTheme = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  themeToggle?.addEventListener("click", toggleTheme);
  footerTheme?.addEventListener("click", toggleTheme);
  setTheme(root.dataset.theme === "light" ? "light" : "dark");

  menuToggle?.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuToggle.querySelector("span").textContent = open ? "close" : "menu";
  });
  mobileMenu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.querySelector("span").textContent = "menu";
  }));

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    topbar.classList.toggle("scrolled", scrollY > 35);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Screenshot carousel: state/transform based, so automatic changes never
  // touch the document's vertical scroll position.
  const track = document.getElementById("screenshotTrack");
  const cards = [...document.querySelectorAll(".screen-card")];
  const prev = document.getElementById("shotPrev");
  const next = document.getElementById("shotNext");
  const current = document.getElementById("shotCurrent");
  const total = document.getElementById("shotTotal");
  if (!track || !cards.length) return;

  total.textContent = String(cards.length).padStart(2, "0");

  let index = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragOffsetX = 0;
  let baseTranslate = 0;
  let autoTimer = null;
  let interactionTimer = null;
  let pointerId = null;

  const gap = () => parseFloat(getComputedStyle(track).gap) || 0;
  const step = () => {
    const card = cards[0];
    return card ? card.getBoundingClientRect().width + gap() : 0;
  };

  const render = ({ animate = true } = {}) => {
    const maxIndex = Math.max(0, cards.length - 1);
    index = Math.max(0, Math.min(maxIndex, index));
    const offset = index * step();
    baseTranslate = offset;
    track.style.transition = animate ? "transform .58s cubic-bezier(.22,.7,.2,1)" : "none";
    track.style.transform = `translate3d(${-offset}px,0,0)`;
    cards.forEach((card, i) => card.classList.toggle("active", i === index));
    current.textContent = String(index + 1).padStart(2, "0");
    track.setAttribute("aria-label", `Screenshot ${index + 1} of ${cards.length}`);
  };

  const go = direction => {
    index = index + direction;
    if (index >= cards.length) index = 0;
    if (index < 0) index = cards.length - 1;
    render();
  };

  const scheduleAuto = (delay = 5000) => {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      if (!document.hidden && !dragging) go(1);
      scheduleAuto(5000);
    }, delay);
  };

  const pauseThenResume = () => {
    clearTimeout(autoTimer);
    clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => scheduleAuto(5000), 7000);
  };

  prev?.addEventListener("click", () => { go(-1); pauseThenResume(); });
  next?.addEventListener("click", () => { go(1); pauseThenResume(); });

  const onPointerDown = event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    pointerId = event.pointerId;
    dragStartX = event.clientX;
    dragOffsetX = 0;
    track.setPointerCapture?.(pointerId);
    track.classList.add("dragging");
    track.style.transition = "none";
    pauseThenResume();
  };

  const onPointerMove = event => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragOffsetX = event.clientX - dragStartX;
    track.style.transform = `translate3d(${-(baseTranslate) + dragOffsetX}px,0,0)`;
  };

  const onPointerUp = event => {
    if (!dragging || (pointerId !== null && event.pointerId !== pointerId)) return;
    const threshold = Math.max(45, Math.min(110, step() * 0.16));
    if (Math.abs(dragOffsetX) > threshold) {
      index += dragOffsetX < 0 ? 1 : -1;
      if (index < 0) index = cards.length - 1;
      if (index >= cards.length) index = 0;
    }
    dragging = false;
    track.classList.remove("dragging");
    pointerId = null;
    render();
    scheduleAuto(5000);
  };

  track.addEventListener("pointerdown", onPointerDown);
  track.addEventListener("pointermove", onPointerMove);
  track.addEventListener("pointerup", onPointerUp);
  track.addEventListener("pointercancel", onPointerUp);
  track.addEventListener("lostpointercapture", () => {
    if (dragging) {
      dragging = false;
      track.classList.remove("dragging");
      render();
      scheduleAuto(5000);
    }
  });
  track.addEventListener("mouseenter", pauseThenResume, { passive: true });
  track.addEventListener("focusin", pauseThenResume, { passive: true });

  addEventListener("resize", () => render({ animate: false }), { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(autoTimer);
    else scheduleAuto(5000);
  });

  render({ animate: false });
  scheduleAuto(5000);
})();
