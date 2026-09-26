(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const footerTheme = document.getElementById("footerTheme");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const progress = document.getElementById("scrollProgress");
  const topbar = document.getElementById("topbar");

  const setTheme = theme => {
    root.dataset.theme = theme;
    localStorage.setItem("neo-theme", theme);
    themeIcon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
  };
  const toggleTheme = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  themeToggle?.addEventListener("click", toggleTheme);
  footerTheme?.addEventListener("click", toggleTheme);
  themeIcon.textContent = root.dataset.theme === "dark" ? "light_mode" : "dark_mode";

  menuToggle?.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.querySelector("span").textContent = open ? "close" : "menu";
  });
  mobileMenu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector("span").textContent = "menu";
  }));

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max ? (scrollY / max) * 100 : 0}%`;
    topbar.classList.toggle("scrolled", scrollY > 35);
  };
  addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Horizontal screenshot carousel: buttons, snap scrolling, active card and touch/mouse drag.
  const track = document.getElementById("screenshotTrack");
  const cards = [...document.querySelectorAll(".screen-card")];
  const prev = document.getElementById("shotPrev");
  const next = document.getElementById("shotNext");
  const current = document.getElementById("shotCurrent");
  const total = document.getElementById("shotTotal");
  total.textContent = String(cards.length).padStart(2, "0");

  let index = 0;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  const updateActive = () => {
    if (!cards.length) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0, distance = Infinity;
    cards.forEach((card, i) => {
      const c = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < distance) { distance = d; best = i; }
    });
    index = best;
    cards.forEach((c, i) => c.classList.toggle("active", i === index));
    current.textContent = String(index + 1).padStart(2, "0");
  };

  const go = direction => {
    if (!cards.length) return;
    index = Math.max(0, Math.min(cards.length - 1, index + direction));
    cards[index].scrollIntoView({behavior:"smooth", inline:"start", block:"nearest"});
  };
  prev?.addEventListener("click", () => go(-1));
  next?.addEventListener("click", () => go(1));
  track?.addEventListener("scroll", () => requestAnimationFrame(updateActive), {passive:true});

  track?.addEventListener("pointerdown", e => {
    dragging = true; startX = e.clientX; startScroll = track.scrollLeft;
    track.classList.add("dragging"); track.setPointerCapture?.(e.pointerId);
  });
  track?.addEventListener("pointermove", e => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (e.clientX - startX) * 1.15;
  });
  const stopDrag = () => { dragging = false; track.classList.remove("dragging"); };
  track?.addEventListener("pointerup", stopDrag);
  track?.addEventListener("pointercancel", stopDrag);
  track?.addEventListener("mouseleave", stopDrag);

  // Small automatic movement only when the carousel is not being touched.
  let autoTimer = setInterval(() => {
    if (!track || dragging || document.hidden) return;
    go(index >= cards.length - 1 ? -(cards.length - 1) : 1);
  }, 5000);
  ["pointerdown","mouseenter","touchstart"].forEach(ev => track?.addEventListener(ev, () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!track || dragging || document.hidden) return;
      go(index >= cards.length - 1 ? -(cards.length - 1) : 1);
    }, 7000);
  }, {passive:true}));

  updateActive();
})();