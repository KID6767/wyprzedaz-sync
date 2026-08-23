const state = {
  products: [],
  filter: "all",
  search: "",
  audio: null,
  audioOn: false
};

const el = {
  grid: document.querySelector("#productGrid"),
  template: document.querySelector("#productTemplate"),
  filters: document.querySelector("#filters"),
  search: document.querySelector("#searchInput"),
  count: document.querySelector("#availableCount"),
  empty: document.querySelector("#emptyState"),
  dialog: document.querySelector("#productDialog"),
  dialogClose: document.querySelector("#dialogClose"),
  dialogImage: document.querySelector("#dialogImage"),
  dialogBrand: document.querySelector("#dialogBrand"),
  dialogName: document.querySelector("#dialogName"),
  dialogSize: document.querySelector("#dialogSize"),
  dialogCondition: document.querySelector("#dialogCondition"),
  dialogDescription: document.querySelector("#dialogDescription"),
  dialogPrice: document.querySelector("#dialogPrice"),
  marketButtons: document.querySelector("#marketButtons"),
  soundToggle: document.querySelector("#soundToggle"),
  soundLabel: document.querySelector(".sound-label"),
  cursorDot: document.querySelector(".cursor-dot"),
  cursorRing: document.querySelector(".cursor-ring")
};

const money = value => new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
}).format(value);

async function loadProducts() {
  try {
    const res = await fetch("./data/products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Nie udało się pobrać products.json");
    state.products = await res.json();
  } catch (err) {
    console.error(err);
    state.products = [];
  }
  renderProducts();
}

function visibleProducts() {
  const q = state.search.trim().toLowerCase();

  return state.products.filter(product => {
    const filterMatch = state.filter === "all" || product.category === state.filter;
    const haystack = [
      product.name,
      product.brand,
      product.size,
      product.category,
      product.condition
    ].join(" ").toLowerCase();

    return filterMatch && (!q || haystack.includes(q));
  });
}

function renderProducts() {
  el.grid.innerHTML = "";
  const products = visibleProducts();

  products.forEach((product, index) => {
    const fragment = el.template.content.cloneNode(true);
    const card = fragment.querySelector(".product-card");
    const img = fragment.querySelector(".product-image");
    const status = fragment.querySelector(".status-badge");
    const cardIndex = fragment.querySelector(".card-index");
    const brand = fragment.querySelector(".product-brand");
    const size = fragment.querySelector(".product-size");
    const name = fragment.querySelector(".product-name");
    const price = fragment.querySelector(".product-price");
    const details = fragment.querySelector(".details-btn");

    card.dataset.id = product.id;
    img.src = product.image;
    img.alt = `${product.brand} — ${product.name}`;
    status.textContent = product.status === "available" ? "● DOSTĘPNE" : "● SPRZEDANE";
    status.classList.add(product.status);
    cardIndex.textContent = String(index + 1).padStart(2, "0");
    brand.textContent = product.brand.toUpperCase();
    size.textContent = product.size ? `ROZMIAR ${product.size}` : product.category.toUpperCase();
    name.textContent = product.name;
    price.textContent = money(product.price);

    const open = () => openProduct(product);
    details.addEventListener("click", open);
    card.addEventListener("dblclick", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter") open();
    });

    attachTilt(card);
    el.grid.appendChild(fragment);
  });

  const available = state.products.filter(p => p.status === "available").length;
  el.count.textContent = String(available).padStart(2, "0");
  el.empty.hidden = products.length !== 0;
  observeReveals();
  attachMagnetic();
}

function openProduct(product) {
  el.dialogImage.src = product.image;
  el.dialogImage.alt = `${product.brand} — ${product.name}`;
  el.dialogBrand.textContent = product.brand.toUpperCase();
  el.dialogName.textContent = product.name;
  el.dialogSize.textContent = product.size ? `Rozmiar: ${product.size}` : product.category;
  el.dialogCondition.textContent = `Stan: ${product.condition}`;
  el.dialogDescription.textContent = product.description;
  el.dialogPrice.textContent = money(product.price);
  el.marketButtons.innerHTML = "";

  const marketplaces = [
    ["allegro", "KUP NA ALLEGRO", product.links?.allegro],
    ["vinted", "KUP NA VINTED", product.links?.vinted],
    ["olx", "KUP NA OLX", product.links?.olx]
  ];

  marketplaces.forEach(([name, label, url]) => {
    const a = document.createElement("a");
    a.className = `market-btn ${name}${url ? "" : " disabled"}`;
    a.href = url || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = `<span>${label}</span><span>↗</span>`;
    el.marketButtons.appendChild(a);
  });

  if (product.status !== "available") {
    [...el.marketButtons.children].forEach(node => node.classList.add("disabled"));
  }

  el.dialog.showModal();
  document.body.classList.add("dialog-open");
}

el.dialogClose.addEventListener("click", () => el.dialog.close());
el.dialog.addEventListener("click", event => {
  const rect = el.dialog.getBoundingClientRect();
  const inDialog =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!inDialog) el.dialog.close();
});
el.dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

el.filters.addEventListener("click", event => {
  const btn = event.target.closest(".filter");
  if (!btn) return;
  document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  state.filter = btn.dataset.filter;
  renderProducts();
});

el.search.addEventListener("input", event => {
  state.search = event.target.value;
  renderProducts();
});

function observeReveals() {
  const items = document.querySelectorAll(".reveal:not(.in-view)");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: "0px 0px -30px 0px" });

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
    observer.observe(item);
  });
}

function attachTilt(card) {
  if (matchMedia("(pointer: coarse)").matches) return;

  card.addEventListener("mousemove", event => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 7;
    const ry = (px - 0.5) * 8;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

function setupCursor() {
  if (matchMedia("(pointer: coarse)").matches) return;

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    el.cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function tick() {
    ringX += (mouseX - ringX) * .14;
    ringY += (mouseY - ringY) * .14;
    el.cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  document.addEventListener("mouseover", event => {
    if (event.target.closest("a, button, input, .product-card")) {
      document.body.classList.add("cursor-hover");
    }
  });
  document.addEventListener("mouseout", event => {
    if (event.target.closest("a, button, input, .product-card")) {
      document.body.classList.remove("cursor-hover");
    }
  });
}

function attachMagnetic() {
  if (matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll(".magnetic").forEach(item => {
    if (item.dataset.magneticReady) return;
    item.dataset.magneticReady = "1";

    item.addEventListener("mousemove", event => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * .09}px, ${y * .09}px)`;
    });
    item.addEventListener("mouseleave", () => {
      item.style.transform = "";
    });
  });
}

/* Generatywny, prosty soundscape WebAudio.
   Startuje dopiero po kliknięciu użytkownika — zgodnie z polityką przeglądarek. */
function createSoundscape() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.055;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 850;
  filter.Q.value = .4;
  filter.connect(master);

  const padGain = ctx.createGain();
  padGain.gain.value = 0.5;
  padGain.connect(filter);

  const base = 55;
  const ratios = [1, 1.4983, 2, 2.3784];

  const oscillators = ratios.map((ratio, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i % 2 ? "triangle" : "sine";
    osc.frequency.value = base * ratio;
    gain.gain.value = 0.05 + (i * 0.008);
    osc.connect(gain);
    gain.connect(padGain);
    osc.start();
    return { osc, gain };
  });

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 240;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  const pulse = ctx.createOscillator();
  const pulseGain = ctx.createGain();
  const pulseLfo = ctx.createOscillator();
  const pulseDepth = ctx.createGain();
  pulse.type = "sine";
  pulse.frequency.value = 110;
  pulseGain.gain.value = 0.0;
  pulse.connect(pulseGain);
  pulseGain.connect(filter);

  pulseLfo.type = "square";
  pulseLfo.frequency.value = 1.3;
  pulseDepth.gain.value = 0.012;
  pulseLfo.connect(pulseDepth);
  pulseDepth.connect(pulseGain.gain);
  pulse.start();
  pulseLfo.start();

  return {
    ctx,
    nodes: [...oscillators.map(x => x.osc), lfo, pulse, pulseLfo],
    master
  };
}

el.soundToggle.addEventListener("click", async () => {
  if (!state.audio) state.audio = createSoundscape();
  if (!state.audio) return;

  if (!state.audioOn) {
    await state.audio.ctx.resume();
    state.audio.master.gain.cancelScheduledValues(state.audio.ctx.currentTime);
    state.audio.master.gain.linearRampToValueAtTime(0.055, state.audio.ctx.currentTime + .6);
    state.audioOn = true;
  } else {
    state.audio.master.gain.cancelScheduledValues(state.audio.ctx.currentTime);
    state.audio.master.gain.linearRampToValueAtTime(0.0001, state.audio.ctx.currentTime + .35);
    setTimeout(() => state.audio.ctx.suspend(), 400);
    state.audioOn = false;
  }

  el.soundToggle.classList.toggle("active", state.audioOn);
  el.soundToggle.setAttribute("aria-pressed", String(state.audioOn));
  el.soundLabel.textContent = state.audioOn ? "SOUND ON" : "SOUND OFF";
});

setupCursor();
attachMagnetic();
observeReveals();
loadProducts();
