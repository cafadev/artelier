/* ==========================================================================
   Artelier — prototipo (vanilla JS, sin backend)
   Estado en memoria: se reinicia al recargar. Es intencional.
   ========================================================================== */
(() => {
'use strict';

/* ----------------------------- datos ----------------------------- */
const CATEGORIES = [
  { id:'escolares',    icon:'i-graduation', label:'Proyectos escolares' },
  { id:'manualidades', icon:'i-scissors',   label:'Manualidades personalizadas' },
  { id:'eventos',      icon:'i-gift',       label:'Decoración de eventos' },
  { id:'papeleria',    icon:'i-notebook',   label:'Papelería especializada' },
];

const PRODUCTS = [
  { id:'maqueta', name:'Maqueta escolar personalizada', short:'Maquetas escolares', cat:'escolares', icon:'i-graduation',
    rating:5, reviews:12, featured:true,
    desc:'Maqueta elaborada con materiales de calidad, diseñada según el tema y especificaciones del cliente. Ideal para proyectos escolares.',
    sizes:[{label:'Pequeña',price:350},{label:'Mediana',price:500},{label:'Grande',price:700}] },

  { id:'cumple', name:'Decoración de cumpleaños', short:'Decoración de cumpleaños', cat:'eventos', icon:'i-gift',
    rating:5, reviews:24, featured:true,
    desc:'Montaje completo de decoración temática: globos, backdrop, mesa dulce y ambientación coordinada con la paleta que elijas.',
    sizes:[{label:'Básico',price:1500},{label:'Completo',price:2400},{label:'Premium',price:3600}] },

  { id:'trifolio', name:'Trifolio temático', short:'Trifolios temáticos', cat:'papeleria', icon:'i-notebook',
    rating:4, reviews:31, featured:true,
    desc:'Trifolios impresos a full color con diseño propio, listos para exposiciones escolares o presentaciones de proyecto.',
    sizes:[{label:'Simple',price:120},{label:'Doble',price:180},{label:'Full color',price:240}] },

  { id:'taza', name:'Taza personalizada', short:'Tazas personalizadas', cat:'manualidades', icon:'i-bag',
    rating:5, reviews:18, featured:true,
    desc:'Taza de cerámica sublimada con nombre, foto o frase. Acabado brillante y resistente al lavado frecuente.',
    sizes:[{label:'Con nombre',price:180},{label:'Con foto',price:220},{label:'Set x2',price:340}] },

  { id:'album', name:'Álbum scrapbook', short:'Álbum scrapbook', cat:'manualidades', icon:'i-scissors',
    rating:5, reviews:9,
    desc:'Álbum artesanal hecho a mano con papeles decorativos, bolsillos y espacios para dedicatorias.',
    sizes:[{label:'10 hojas',price:450},{label:'20 hojas',price:720},{label:'30 hojas',price:980}] },

  { id:'invitaciones', name:'Invitaciones personalizadas', short:'Invitaciones', cat:'papeleria', icon:'i-notebook',
    rating:5, reviews:40,
    desc:'Invitaciones diseñadas a medida para bodas, quinceaños o cumpleaños, con impresión en papel de alto gramaje.',
    sizes:[{label:'Pack 10',price:250},{label:'Pack 25',price:560},{label:'Pack 50',price:990}] },

  { id:'centro', name:'Centro de mesa artesanal', short:'Centros de mesa', cat:'eventos', icon:'i-gift',
    rating:4, reviews:14,
    desc:'Centros de mesa elaborados con flores preservadas y bases decoradas a mano, coordinados con tu evento.',
    sizes:[{label:'Pequeño',price:320},{label:'Mediano',price:480},{label:'Grande',price:650}] },

  { id:'rotulos', name:'Rótulos escolares', short:'Rótulos escolares', cat:'escolares', icon:'i-graduation',
    rating:4, reviews:7,
    desc:'Rótulos y carteles escolares rotulados a mano, con tipografía clara y materiales resistentes.',
    sizes:[{label:'Carta',price:90},{label:'Tabloide',price:140},{label:'Pliego',price:210}] },
];

const SLIDES = [
  { title:'Ideas que dan vida a tus momentos', sub:'Manualidades · Papelería<br>Decoración de eventos', icon:'i-gift',     img:'hero-1',  go:null },
  { title:'Decoración que celebra cada evento', sub:'Cumpleaños · Bodas<br>Graduaciones',                icon:'i-scissors', img:'cumple',  go:'eventos' },
  { title:'Papelería con tu estilo personal',   sub:'Invitaciones · Trifolios<br>Etiquetas',             icon:'i-notebook', img:'trifolio',go:'papeleria' },
];

const SHIPPING = 50;

const STATUS = {
  'Entregado':      'pill-ok',
  'En camino':      'pill-warn',
  'En preparación': 'pill-info',
  'Recibido':       'pill-neutral',
};

/* ----------------------------- estado ----------------------------- */
const state = {
  cart: [
    { pid:'maqueta',  size:'Pequeña',     price:350, qty:1 },
    { pid:'trifolio', size:'Simple',      price:120, qty:1 },
    { pid:'taza',     size:'Con nombre',  price:180, qty:1 },
  ],
  orders: [
    { id:1024, date:'20 de mayo, 2024', status:'Entregado',      total:650,  pid:'maqueta' },
    { id:1023, date:'15 de mayo, 2024', status:'En camino',      total:1200, pid:'cumple' },
    { id:1022, date:'10 de mayo, 2024', status:'En preparación', total:350,  pid:'trifolio' },
    { id:1021, date:'5 de mayo, 2024',  status:'Recibido',       total:180,  pid:'taza' },
  ],
  product: null,     // producto abierto
  sizeIndex: 0,
  qty: 1,
  slide: 0,
  filter: 'todos',
  query: '',
  history: [],
  sheetIndex: null,
};

/* ----------------------------- utilidades ----------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const money = n => 'L.' + n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
const svg = (icon, cls) => `<svg class="ico ${cls}"><use href="#${icon}"/></svg>`;
/* Placeholder + intento de foto real: si assets/<slug>.jpg no existe, el <img> se
   descarta solo y queda el degradado con el icono. Ver README → "Imágenes reales". */
const photo = (slug, icon, icoCls = '', cls = '', id = '') =>
  `<span ${id ? `id="${id}" ` : ''}class="photo ${cls}">${svg(icon, icoCls)}` +
  `<img src="assets/${slug}.jpg" alt="" loading="lazy" onerror="this.remove()"></span>`;
const productById = id => PRODUCTS.find(p => p.id === id);
const subtotal = cart => cart.reduce((sum, it) => sum + it.price * it.qty, 0);
const cartCount = cart => cart.reduce((sum, it) => sum + it.qty, 0);

/* añade al carrito fusionando la línea si coinciden producto y tamaño */
function addToCart(cart, line){
  const found = cart.find(it => it.pid === line.pid && it.size === line.size);
  if (found) found.qty += line.qty;
  else cart.push({ ...line });
  return cart;
}

let toastTimer;
function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

/* ----------------------------- navegación ----------------------------- */
function go(name, push = true){
  const target = $('#screen-' + name);
  if (!target) return;
  const current = $('.screen.is-active');
  if (current === target) return;
  if (push && current) state.history.push(current.id.replace('screen-', ''));

  current?.classList.remove('is-active');
  target.classList.add('is-active');
  $('.scroll', target).scrollTop = 0;

  const tab = target.dataset.tab;                 // producto/nosotros no son tabs: conservan el tab de origen
  if (tab) $$('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.go === tab));
  closeDrawer();
}

function back(){
  const prev = state.history.pop();
  go(prev || 'inicio', false);
}

/* ----------------------------- inicio ----------------------------- */
function renderSlide(){
  const s = SLIDES[state.slide];
  $('.hero-title').innerHTML = s.title;
  $('.hero-sub').innerHTML = s.sub;
  $('#hero .hero-photo').outerHTML = photo(s.img, s.icon, 'ico-40', 'hero-photo');
  $('#hero-dots').innerHTML = SLIDES
    .map((_, i) => `<button class="dot ${i === state.slide ? 'is-active' : ''}" data-slide="${i}" aria-label="Slide ${i+1}"></button>`)
    .join('');
}

function renderHome(){
  $('#cat-row').innerHTML = CATEGORIES.map(c => `
    <button class="cat" data-cat="${c.id}">
      <span class="cat-tile">${svg(c.icon, 'ico-25')}</span>
      <span>${c.label}</span>
    </button>`).join('');

  $('#prod-row').innerHTML = PRODUCTS.filter(p => p.featured).map(p => `
    <button class="card" data-product="${p.id}">
      ${photo(p.id, p.icon, 'ico-25')}
      <span class="card-name">${p.short}</span>
      <span class="card-price">Desde ${money(p.sizes[0].price).replace('.00','')}</span>
    </button>`).join('');

  renderSlide();
}

/* ----------------------------- catálogo ----------------------------- */
function renderCatalog(){
  const chips = [{ id:'todos', label:'Todos' }, ...CATEGORIES.map(c => ({ id:c.id, label:c.label.split(' ')[0] }))];
  $('#catalog-chips').innerHTML = chips
    .map(c => `<button class="chip ${state.filter === c.id ? 'is-active' : ''}" data-chip="${c.id}">${c.label}</button>`)
    .join('');

  const q = state.query.trim().toLowerCase();
  const list = PRODUCTS.filter(p =>
    (state.filter === 'todos' || p.cat === state.filter) &&
    (!q || (p.name + ' ' + p.desc).toLowerCase().includes(q))
  );

  $('#catalog-grid').innerHTML = list.map(p => `
    <button class="card" data-product="${p.id}">
      ${photo(p.id, p.icon, 'ico-40')}
      <span class="card-name">${p.name}</span>
      <span class="card-price">Desde ${money(p.sizes[0].price).replace('.00','')}</span>
    </button>`).join('');

  $('#catalog-empty').hidden = list.length > 0;
}

/* ----------------------------- producto ----------------------------- */
function openProduct(id){
  const p = productById(id);
  if (!p) return;
  state.product = p;
  state.sizeIndex = 0;
  state.qty = 1;
  $('#btn-fav').setAttribute('aria-pressed', 'false');
  $('#btn-fav .ico').style.fill = 'none';
  renderProduct();
  go('producto');
}

function renderProduct(){
  const p = state.product;
  $('#gallery-photo').outerHTML = photo(p.id, p.icon, 'ico-64', 'gallery-photo', 'gallery-photo');
  $('#product-title').textContent = p.name;
  $('#product-price').textContent = money(p.sizes[state.sizeIndex].price);
  $('#product-stars').innerHTML = [0,1,2,3,4]
    .map(i => `<svg class="ico ${i < p.rating ? '' : 'is-empty'}"><use href="#i-star"/></svg>`).join('');
  $('#product-reviews').textContent = `(${p.reviews})`;
  $('#product-desc').textContent = p.desc;
  $('#product-qty').textContent = state.qty;

  $('#product-sizes').innerHTML = p.sizes.map((s, i) => `
    <button class="size ${i === state.sizeIndex ? 'is-active' : ''}" data-size="${i}">
      <b>${s.label}</b><small>${money(s.price).replace('.00','')}</small>
    </button>`).join('');

  $('#gallery-dots').innerHTML = [0,1,2,3]
    .map(i => `<button class="dot ${i === 0 ? 'is-active' : ''}" data-gallery="${i}" aria-label="Foto ${i+1}"></button>`)
    .join('');
}

/* ----------------------------- carrito ----------------------------- */
function renderCart(){
  const has = state.cart.length > 0;
  $('#cart-items').innerHTML = state.cart.map((it, i) => {
    const p = productById(it.pid);
    return `
    <div class="cart-item">
      ${photo(p.id, p.icon)}
      <div class="cart-meta">
        <p class="cart-name">${p.name}</p>
        <p class="cart-variant">${it.size}</p>
        <p class="cart-price">${money(it.price * it.qty)}</p>
      </div>
      <div class="cart-actions">
        <button class="icon-btn" data-sheet="${i}" aria-label="Opciones de ${p.name}">${svg('i-more-vertical','ico-16')}</button>
        <div class="stepper">
          <button class="step" data-cart-qty="${i}" data-delta="-1" aria-label="Quitar uno">${svg('i-minus','ico-14')}</button>
          <span>${it.qty}</span>
          <button class="step" data-cart-qty="${i}" data-delta="1" aria-label="Agregar uno">${svg('i-plus','ico-14')}</button>
        </div>
      </div>
    </div>`;
  }).join('');

  $('#cart-empty').hidden = has;
  $('#cart-footer').hidden = !has;

  const sub = subtotal(state.cart);
  $('#sum-subtotal').textContent = money(sub);
  $('#sum-shipping').textContent = money(has ? SHIPPING : 0);
  $('#sum-total').textContent = money(has ? sub + SHIPPING : 0);
  updateBadge();
}

function updateBadge(){
  const n = cartCount(state.cart);
  $$('[data-cart-badge]').forEach(b => { b.textContent = n; b.hidden = n === 0; });
}

/* ----------------------------- pedidos ----------------------------- */
function renderOrders(){
  $('#order-list').innerHTML = state.orders.map(o => {
    const p = productById(o.pid);
    return `
    <button class="order" data-order="${o.id}">
      ${photo(p.id, p.icon)}
      <span class="order-meta">
        <span class="order-id">Pedido #${o.id}</span>
        <span class="order-line">
          <span class="order-date">${o.date}</span>
          <span class="pill ${STATUS[o.status]}">${o.status}</span>
        </span>
        <span class="order-total">${money(o.total)}</span>
      </span>
      ${svg('i-chevron-right','ico-16 row-chev')}
    </button>`;
  }).join('');
}

/* ----------------------------- overlays ----------------------------- */
function openDrawer(){ $('#drawer').hidden = false; $('#drawer-backdrop').hidden = false; }
function closeDrawer(){ $('#drawer').hidden = true; $('#drawer-backdrop').hidden = true; }
function openSheet(i){
  state.sheetIndex = i;
  $('#sheet-title').textContent = productById(state.cart[i].pid).name;
  $('#sheet').hidden = false; $('#sheet-backdrop').hidden = false;
}
function closeSheet(){ state.sheetIndex = null; $('#sheet').hidden = true; $('#sheet-backdrop').hidden = true; }

/* ----------------------------- eventos ----------------------------- */
document.addEventListener('click', e => {
  const t = e.target;

  const goEl = t.closest('[data-go]');
  if (goEl) { go(goEl.dataset.go); return; }

  if (t.closest('[data-back]')) { back(); return; }

  const soon = t.closest('[data-soon]');
  if (soon) { toast(`${soon.dataset.soon}: disponible en la versión final`); return; }

  const cat = t.closest('[data-cat]');
  if (cat) { state.filter = cat.dataset.cat; state.query = ''; $('#catalog-search').value = ''; renderCatalog(); go('productos'); return; }

  const chip = t.closest('[data-chip]');
  if (chip) { state.filter = chip.dataset.chip; renderCatalog(); return; }

  const card = t.closest('[data-product]');
  if (card) { openProduct(card.dataset.product); return; }

  const slide = t.closest('[data-slide]');
  if (slide) { state.slide = +slide.dataset.slide; renderSlide(); return; }

  const heroCta = t.closest('[data-hero-cta]');
  if (heroCta) {
    const target = SLIDES[state.slide].go;
    state.filter = target || 'todos';
    renderCatalog();
    go('productos');
    return;
  }

  const size = t.closest('[data-size]');
  if (size) { state.sizeIndex = +size.dataset.size; renderProduct(); return; }

  const gdot = t.closest('[data-gallery]');
  if (gdot) {
    $$('#gallery-dots .dot').forEach((d, i) => d.classList.toggle('is-active', i === +gdot.dataset.gallery));
    $('#gallery-photo').style.filter = `hue-rotate(${gdot.dataset.gallery * 12}deg)`;
    return;
  }

  const qty = t.closest('[data-qty]');
  if (qty) { state.qty = Math.max(1, state.qty + +qty.dataset.qty); $('#product-qty').textContent = state.qty; return; }

  const cq = t.closest('[data-cart-qty]');
  if (cq) {
    const i = +cq.dataset.cartQty;
    state.cart[i].qty += +cq.dataset.delta;
    if (state.cart[i].qty < 1) state.cart.splice(i, 1);
    renderCart();
    return;
  }

  const sheet = t.closest('[data-sheet]');
  if (sheet) { openSheet(+sheet.dataset.sheet); return; }

  const order = t.closest('[data-order]');
  if (order) { toast(`Detalle del pedido #${order.dataset.order}: disponible en la versión final`); return; }
});

$('#btn-menu').addEventListener('click', openDrawer);
$('#btn-close-drawer').addEventListener('click', closeDrawer);
$('#drawer-backdrop').addEventListener('click', closeDrawer);
$('#sheet-backdrop').addEventListener('click', closeSheet);
$('#sheet-cancel').addEventListener('click', closeSheet);

$('#sheet-remove').addEventListener('click', () => {
  state.cart.splice(state.sheetIndex, 1);
  closeSheet();
  renderCart();
  toast('Producto eliminado del carrito');
});

$('#btn-fav').addEventListener('click', e => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', String(on));
  $('#btn-fav .ico').style.fill = on ? 'currentColor' : 'none';
  toast(on ? 'Agregado a favoritos' : 'Quitado de favoritos');
});

$('#btn-add').addEventListener('click', () => {
  const p = state.product, s = p.sizes[state.sizeIndex];
  addToCart(state.cart, { pid:p.id, size:s.label, price:s.price, qty:state.qty });
  renderCart();
  toast(`${p.name} · ${s.label} agregado al carrito`);
});

$('#btn-clear-cart').addEventListener('click', () => {
  if (!state.cart.length) return;
  state.cart = [];
  renderCart();
  toast('Carrito vaciado');
});

$('#btn-checkout').addEventListener('click', () => {
  const total = subtotal(state.cart) + SHIPPING;
  const id = Math.max(...state.orders.map(o => o.id)) + 1;
  state.orders.unshift({
    id, total, status:'Recibido', pid:state.cart[0].pid,
    date:new Date().toLocaleDateString('es-HN', { day:'numeric', month:'long' }) + ', ' + new Date().getFullYear(),
  });
  state.cart = [];
  renderCart();
  renderOrders();
  go('pedidos');
  toast(`¡Pedido #${id} recibido! Te contactaremos por WhatsApp.`);
});

$('#btn-all-orders').addEventListener('click', () => toast('Historial completo: disponible en la versión final'));

const onSearch = e => {
  state.query = e.target.value;
  if (e.target.id === 'search-input') {
    $('#catalog-search').value = state.query;
    state.filter = 'todos';
    renderCatalog();
    if (state.query.trim()) go('productos');
  } else {
    renderCatalog();
  }
};
$('#search-input').addEventListener('input', onSearch);
$('#catalog-search').addEventListener('input', onSearch);

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#sheet').hidden) closeSheet();
  else if (!$('#drawer').hidden) closeDrawer();
});

/* carrusel del hero */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    if (!$('#screen-inicio').classList.contains('is-active')) return;
    state.slide = (state.slide + 1) % SLIDES.length;
    renderSlide();
  }, 5000);
}

/* ----------------------------- arranque ----------------------------- */
renderHome();
renderCatalog();
renderCart();
renderOrders();

/* ----------------------------- self-check ----------------------------- */
/* abre index.html?test=1 y mirá la consola */
if (location.search.includes('test=1')) {
  const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: ${a} != ${b}`); };
  const cart = [];
  addToCart(cart, { pid:'taza', size:'Con nombre', price:180, qty:1 });
  addToCart(cart, { pid:'taza', size:'Con nombre', price:180, qty:2 });
  eq(cart.length, 1, 'misma variante debe fusionarse');
  eq(cart[0].qty, 3, 'cantidades sumadas');
  addToCart(cart, { pid:'taza', size:'Con foto', price:220, qty:1 });
  eq(cart.length, 2, 'variante distinta es línea nueva');
  eq(subtotal(cart), 760, 'subtotal 3*180 + 220');
  eq(cartCount(cart), 4, 'unidades totales');
  eq(money(1200), 'L.1,200.00', 'formato de moneda');
  eq(subtotal([]), 0, 'carrito vacío');
  console.log('%c✓ self-check OK', 'color:#2f6b4a;font-weight:600');
}
})();
