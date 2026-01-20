(function () {
      const canvas = document.getElementById("heroParticles");
      if (!canvas) return;

      const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      const subtle = (canvas.dataset.variant || "") === "subtle";

      const CFG = subtle ? {
        density: 0.000022,
        maxParticles: 75,
        minParticles: 34,
        speed: 0.12,
        radiusMin: 0.7,
        radiusMax: 1.6,
        linkDist: 170,
        linkAlpha: 0.12,
        dotAlpha: 0.30,
        colors: [
          "rgba(255,255,255,0.95)",
          "rgba(56,189,248,1)",
          "rgba(34,197,94,1)"
        ]
      } : {
        density: 0.00003,
        maxParticles: 95,
        minParticles: 46,
        speed: 0.18,
        radiusMin: 0.8,
        radiusMax: 1.9,
        linkDist: 180,
        linkAlpha: 0.18,
        dotAlpha: 0.42,
        colors: [
          "rgba(255,255,255,0.95)",
          "rgba(56,189,248,1)",
          "rgba(34,197,94,1)"
        ]
      };

      let w = 0, h = 0, dpr = 1;
      let particles = [];
      let raf = 0;

      function rand(min, max) { return Math.random() * (max - min) + min; }
      function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

      function resize() {
        const parent = canvas.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();

        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = Math.max(1, Math.floor(rect.width));
        h = Math.max(1, Math.floor(rect.height));

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const target = Math.max(
          CFG.minParticles,
          Math.min(CFG.maxParticles, Math.floor(w * h * CFG.density))
        );

        particles = Array.from({ length: target }, () => ({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-CFG.speed, CFG.speed),
          vy: rand(-CFG.speed, CFG.speed),
          r: rand(CFG.radiusMin, CFG.radiusMax),
          c: pick(CFG.colors)
        }));
      }

      function step() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];

          a.x += a.vx;
          a.y += a.vy;

          if (a.x < -20) a.x = w + 20;
          if (a.x > w + 20) a.x = -20;
          if (a.y < -20) a.y = h + 20;
          if (a.y > h + 20) a.y = -20;

          ctx.beginPath();
          ctx.fillStyle = a.c.replace("0.9", CFG.dotAlpha.toFixed(2));
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > CFG.linkDist) continue;

            const t = 1 - dist / CFG.linkDist;
            ctx.strokeStyle = `rgba(255,255,255,${(CFG.linkAlpha * t).toFixed(3)})`;
            ctx.lineWidth = 1.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        raf = requestAnimationFrame(step);
      }

      let ro = null;
      if ("ResizeObserver" in window) {
        ro = new ResizeObserver(() => resize());
        ro.observe(canvas.parentElement || canvas);
      } else {
        window.addEventListener("resize", resize);
      }

      resize();
      raf = requestAnimationFrame(step);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(step);
      });
    })();
