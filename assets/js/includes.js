(() => {
const path = location.pathname;
const isEN = path.includes('/en/');
const lang = isEN ? 'en' : 'es';
const parts = path.split('/').filter(Boolean);
const langIdx = parts.findIndex(p=>p==='en'||p==='es');
const prefix = langIdx>0?'/'+parts.slice(0,langIdx).join('/'):'';
const u = p => prefix+p;

const routes={
 en:{home:'/en/index.html',about:'/en/about.html',services:'/en/services.html',work:'/en/work.html',clients:'/en/clients.html',contact:'/en/contact.html'},
 es:{home:'/es/index.html',about:'/es/nosotros.html',services:'/es/servicios.html',work:'/es/trabajos.html',clients:'/es/clientes.html',contact:'/es/contacto.html'}
};

const switchMap={
 '/en/index.html':'/es/index.html',
 '/es/index.html':'/en/index.html'
};

async function load(){
 const h=document.getElementById('siteHeader');
 const f=document.getElementById('siteFooter');
 if(!h||!f) return;
 h.innerHTML=await fetch(u('/partials/header.html')).then(r=>r.text());
 f.innerHTML=await fetch(u('/partials/footer.html')).then(r=>r.text());

 const r=routes[lang];
 h.querySelector('[data-home]').href=u(r.home);
 h.querySelector('[data-logo]').src=u('/assets/img/orugga_logo_color_transparent.png');

 ['about','services','work','clients','contact'].forEach(k=>{
   const a=h.querySelector(`[data-nav="${k}"]`);
   if(a) a.href=u(r[k]);
   const b=f.querySelector(`[data-foot="${k}"]`);
   if(b) b.href=u(r[k]);
 });
 h.querySelector('[data-cta]').href=u(r.contact);

 const sw=h.querySelector('[data-lang-switch]');
 sw.href=u(switchMap[path]|| (lang==='en'?'/es/index.html':'/en/index.html'));
 sw.textContent=lang==='en'?'ES':'EN';
}
load();
})();