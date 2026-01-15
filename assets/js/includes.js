(() => {
  const path = location.pathname;

  // Detect language based on URL: /en/... or /es/...
  const isEN = path.includes("/en/");
  const lang = isEN ? "en" : "es";

  // GitHub Pages repo base handling (supports /<repo>/en/..)
  const parts = path.split("/").filter(Boolean);
  const langIdx = parts.findIndex(p => p === "en" || p === "es");
  const basePrefix = langIdx > 0 ? "/" + parts.slice(0, langIdx).join("/") : "";
  const u = (p) => basePrefix + p;

  // Routes per language
  const routes = {
    en: { home: "/en/index.html", services: "/en/index.html#services", contact: "/en/index.html#contact" },
    es: { home: "/es/index.html", services: "/es/index.html#services", contact: "/es/index.html#contact" }
  };

  const switchTo = (lang === "en") ? "/es/index.html" : "/en/index.html";

  // Duplicates items for seamless loop (translateX(-50%))
  function initClientsMarquee() {
    const tracks = document.querySelectorAll("[data-clients-track]");
    if (!tracks.length) return;

    tracks.forEach(track => {
      if (track.dataset.duped === "1") return;
      const kids = Array.from(track.children);
      kids.forEach(node => track.appendChild(node.cloneNode(true)));
      track.dataset.duped = "1";
    });
  }

  // Header shrink on scroll (requires CSS .header.is-scrolled ...)
  function initHeaderShrink() {
    const header = document.querySelector(".header");
    if (!header) return;

    const THRESHOLD = 12;

    document.body.classList.add("has-fixed-header");

    const setOffset = () => {
      // Keep layout stable for fixed headers
      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-h", `${Math.round(h)}px`);
    };

    const apply = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      header.classList.toggle("is-scrolled", y > THRESHOLD);
      setOffset();
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
  }

  // Mobile menu toggle (if your header partial provides these data-attrs)
  function initMobileNav() {
    const btn = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!btn || !panel) return;

    // avoid double-binding if navigating/rehydrating
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // nice-to-have: close menu when clicking a link inside
    panel.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      panel.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  async function injectPartials() {
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");
    if (!headerHost || !footerHost) return;

    headerHost.innerHTML = await fetch(u("/partials/header.html")).then(r => r.text());
    footerHost.innerHTML = await fetch(u("/partials/footer.html")).then(r => r.text());

    const r = routes[lang];

    // Set logo (transparent png)
    const logo = headerHost.querySelector("[data-logo]");
    if (logo) logo.src = u("/assets/img/orugga_logo_white_transparent_wgreen.png");

    // Home link on brand
    const home = headerHost.querySelector("[data-home]");
    if (home) home.href = u(r.home);

    // Nav links
    const navHome = headerHost.querySelector('[data-nav="home"]');
    if (navHome) navHome.href = u(r.home);

    const navServices = headerHost.querySelector('[data-nav="services"]');
    if (navServices) navServices.href = u(r.services);

    const navContact = headerHost.querySelector('[data-nav="contact"]');
    if (navContact) navContact.href = u(r.contact);

    // CTA
    const cta = headerHost.querySelector("[data-cta]");
    if (cta) cta.href = u(r.contact);

    // Footer links
    const fHome = footerHost.querySelector('[data-foot="home"]');
    if (fHome) fHome.href = u(r.home);

    const fServices = footerHost.querySelector('[data-foot="services"]');
    if (fServices) fServices.href = u(r.services);

    const fContact = footerHost.querySelector('[data-foot="contact"]');
    if (fContact) fContact.href = u(r.contact);

    // Language switch
    const langSwitch = headerHost.querySelector("[data-lang-switch]");
    if (langSwitch) {
      langSwitch.href = u(switchTo);
      langSwitch.textContent = (lang === "en") ? "ES" : "EN";
    }

    // Init behaviors AFTER DOM injection
    initClientsMarquee();
    initHeaderShrink();
    initMobileNav();
  }

  injectPartials();
})();
