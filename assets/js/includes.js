(() => {
  const path = location.pathname;

  // Detect language based on URL folder: /en/... or /es/...
  const isEN = path.includes("/en/");
  const lang = isEN ? "en" : "es";

  // Use RELATIVE paths to avoid GitHub Pages base-path issues.
  // Pages live under /en and /es, while assets + partials live one level up.
  const P = {
    partialHeader: "../partials/header.html",
    partialFooter: "../partials/footer.html",
    logo: "../assets/img/orugga_logo_white_transparent_wgreen.png",
    switchTo: isEN ? "../es/index.html" : "../en/index.html",
    routes: {
      en: {
        home: "./index.html",
        services: "./index.html#services",
        contact: "./index.html#contact",
      },
      es: {
        home: "./index.html",
        services: "./index.html#services",
        contact: "./index.html#contacto",
      },
    },
  };

  // Duplicates items for seamless loop (translateX(-50%))
  function initClientsMarquee() {
    const tracks = document.querySelectorAll("[data-clients-track]");
    if (!tracks.length) return;

    tracks.forEach((track) => {
      if (track.dataset.duped === "1") return;
      const kids = Array.from(track.children);
      kids.forEach((node) => track.appendChild(node.cloneNode(true)));
      track.dataset.duped = "1";
    });
  }

  // Header shrink on scroll (requires CSS .header.is-scrolled ...)
  function initHeaderShrink() {
    const header = document.querySelector(".header");
    if (!header) return;

    const THRESHOLD = 12;

    const apply = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      header.classList.toggle("is-scrolled", y > THRESHOLD);

      // Keep a reliable CSS var for layouts that depend on header height
      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-h", `${Math.round(h)}px`);
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

    // close menu when clicking a link inside
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

    // Fetch partials (relative paths to avoid base-path 404s)
    const [headerHTML, footerHTML] = await Promise.all([
      fetch(P.partialHeader).then((r) => {
        if (!r.ok) throw new Error(`Header partial not found: ${P.partialHeader}`);
        return r.text();
      }),
      fetch(P.partialFooter).then((r) => {
        if (!r.ok) throw new Error(`Footer partial not found: ${P.partialFooter}`);
        return r.text();
      }),
    ]);

    headerHost.innerHTML = headerHTML;
    footerHost.innerHTML = footerHTML;

    const r = P.routes[lang];

    // Set logo
    const logo = headerHost.querySelector("[data-logo]");
    if (logo) logo.src = P.logo;

    // Home link on brand
    const home = headerHost.querySelector("[data-home]");
    if (home) home.href = r.home;

    // Nav links
    const navHome = headerHost.querySelector('[data-nav="home"]');
    if (navHome) navHome.href = r.home;

    const navServices = headerHost.querySelector('[data-nav="services"]');
    if (navServices) navServices.href = r.services;

    const navContact = headerHost.querySelector('[data-nav="contact"]');
    if (navContact) navContact.href = r.contact;

    // CTA
    const cta = headerHost.querySelector("[data-cta]");
    if (cta) cta.href = r.contact;

    // Footer links
    const fHome = footerHost.querySelector('[data-foot="home"]');
    if (fHome) fHome.href = r.home;

    const fServices = footerHost.querySelector('[data-foot="services"]');
    if (fServices) fServices.href = r.services;

    const fContact = footerHost.querySelector('[data-foot="contact"]');
    if (fContact) fContact.href = r.contact;

    // Language switch
    const langSwitch = headerHost.querySelector("[data-lang-switch]");
    if (langSwitch) {
      langSwitch.href = P.switchTo;
      langSwitch.textContent = lang === "en" ? "ES" : "EN";
    }

    // Init behaviors AFTER DOM injection
    initClientsMarquee();
    initHeaderShrink();
    initMobileNav();
  }

  // Keep failures visible in console (helps debugging on Pages)
  injectPartials().catch((err) => {
    console.error("Failed to inject partials:", err);
  });
})();
