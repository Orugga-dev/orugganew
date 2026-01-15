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

  async function injectPartials() {
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");
    if (!headerHost || !footerHost) return;

    headerHost.innerHTML = await fetch(u("/partials/header.html")).then(r => r.text());
    footerHost.innerHTML = await fetch(u("/partials/footer.html")).then(r => r.text());

    const r = routes[lang];

    // Set logo (transparent png)
    const logo = headerHost.querySelector("[data-logo]");
    if (logo) logo.src = u("/assets/img/orugga_logo_transparent.png");

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
  }

  injectPartials();
})();
