(() => {
  // Detect language from path: /en/... or /es/...
  const path = window.location.pathname;
  const isEN = path.includes("/en/");
  const lang = isEN ? "en" : "es";

  // Find repo base prefix for GitHub Pages:
  // Example: /YourRepo/en/index.html -> prefix = /YourRepo
  // Example: /en/index.html         -> prefix = ""
  const parts = path.split("/").filter(Boolean);
  const langIdx = parts.findIndex(p => p === "en" || p === "es");
  const prefix = langIdx > 0 ? `/${parts.slice(0, langIdx).join("/")}` : "";

  // Helper to build full URL inside the site
  const u = (p) => `${prefix}${p}`;

  // Routes per language (keep your final slugs here)
  const routes = {
    en: {
      home: "/en/index.html",
      about: "/en/about.html",
      services: "/en/services.html",
      work: "/en/work.html",
      clients: "/en/clients.html",
      contact: "/en/contact.html",
    },
    es: {
      home: "/es/index.html",
      about: "/es/nosotros.html",
      services: "/es/servicios.html",
      work: "/es/trabajos.html",
      clients: "/es/clientes.html",
      contact: "/es/contacto.html",
    },
  };

  // Page mapping for language switch (en <-> es)
  const switchMap = {
    "/en/index.html": "/es/index.html",
    "/en/about.html": "/es/nosotros.html",
    "/en/services.html": "/es/servicios.html",
    "/en/work.html": "/es/trabajos.html",
    "/en/clients.html": "/es/clientes.html",
    "/en/contact.html": "/es/contacto.html",

    "/es/index.html": "/en/index.html",
    "/es/nosotros.html": "/en/about.html",
    "/es/servicios.html": "/en/services.html",
    "/es/trabajos.html": "/en/work.html",
    "/es/clientes.html": "/en/clients.html",
    "/es/contacto.html": "/en/contact.html",
  };

  // Logos (new Orugga logo)
  const logoDark = u("/assets/img/orugga_logo_white_on_dark_clean.png");
  const logoLight = u("/assets/img/orugga_logo_color_transparent.png");

  function pickLogo() {
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? logoLight : logoDark;
  }

  async function injectPartials() {
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");
    if (!headerHost || !footerHost) return;

    const [headerHTML, footerHTML] = await Promise.all([
      fetch(u("/partials/header.html")).then(r => r.text()),
      fetch(u("/partials/footer.html")).then(r => r.text()),
    ]);

    headerHost.innerHTML = headerHTML;
    footerHost.innerHTML = footerHTML;

    const r = routes[lang];

    // Brand link + logo
    const homeA = headerHost.querySelector("[data-home]");
    if (homeA) homeA.href = u(r.home);

    const logoImg = headerHost.querySelector("[data-logo]");
    if (logoImg) logoImg.src = pickLogo();

    // Nav links
    const setHref = (sel, href) => {
      const el = headerHost.querySelector(sel);
      if (el) el.href = u(href);
    };
    setHref('[data-nav="about"]', r.about);
    setHref('[data-nav="services"]', r.services);
    setHref('[data-nav="work"]', r.work);
    setHref('[data-nav="clients"]', r.clients);
    setHref('[data-nav="contact"]', r.contact);

    // CTA
    const cta = headerHost.querySelector("[data-cta]");
    if (cta) cta.href = u(r.contact);

    // Footer links
    const setFoot = (key, href) => {
      const el = footerHost.querySelector(`[data-foot="${key}"]`);
      if (el) el.href = u(href);
    };
    setFoot("about", r.about);
    setFoot("services", r.services);
    setFoot("work", r.work);
    setFoot("clients", r.clients);
    setFoot("contact", r.contact);

    // Determine current page key
    const current = (() => {
      if (path.endsWith("/en/")) return "/en/index.html";
      if (path.endsWith("/es/")) return "/es/index.html";

      if (langIdx >= 0) {
        const langSeg = `/${parts[langIdx]}`;
        const fileSeg = parts[langIdx + 1] ? `/${parts[langIdx + 1]}` : "/index.html";
        return `${langSeg}${fileSeg}`;
      }
      return "/en/index.html";
    })();

    // Language switch
    const target = switchMap[current] || (lang === "en" ? "/es/index.html" : "/en/index.html");
    const langA = headerHost.querySelector("[data-lang-switch]");
    if (langA) {
      langA.href = u(target);
      langA.textContent = lang === "en" ? "ES" : "EN";
    }

    // Update logo on scheme change
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      mq.addEventListener?.("change", () => {
        const li = headerHost.querySelector("[data-logo]");
        if (li) li.src = pickLogo();
      });
    }
  }

  injectPartials().catch(err => console.error("includes.js error:", err));
})();