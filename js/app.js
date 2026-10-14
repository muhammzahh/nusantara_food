const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const state = { pulau: "", q: "", jenis: "", spice: "", onlyFav: false };
let favs = [];
try {
  favs = JSON.parse(localStorage.getItem("favs") || "[]");
} catch (e) {}

const PULAU = [
  "Sumatera",
  "Kalimantan",
  "Sulawesi",
  "Papua",
  "Jawa",
  "Bali & Nusa Tenggara",
  "Maluku"
];

const PULAU_SUB = {
  "Sumatera": "Rempah Kari & Santan",
  "Kalimantan": "Aromatik Sungai & Rimba",
  "Sulawesi": "Segar Laut & Kemangi",
  "Papua": "Sagu & Kuah Kuning",
  "Jawa": "Manis Gurih & Kluwek",
  "Bali & Nusa Tenggara": "Base Genep & Bakar Pedas",
  "Maluku": "Kepulauan Rempah Segar"
};

const SPICE = ["Tidak pedas", "Sedikit pedas", "Pedas", "Sangat pedas"];
const SPICE_COLORS = ["spice-0", "spice-1", "spice-2", "spice-3"];

const TYPE_OPTIONS = [
  { value: "", label: "Semua jenis", desc: "Seluruh kategori hidangan", icon: "" },
  { value: "Makanan berat", label: "Makanan berat", desc: "Hidangan utama mengenyangkan", icon: "" },
  { value: "Camilan", label: "Camilan", desc: "Kudapan & pelengkap", icon: "" },
  { value: "Minuman", label: "Minuman", desc: "Penyegar khas tradisional", icon: "" }
];

const SPICE_OPTIONS = [
  { value: "", label: "Semua rasa", desc: "Semua tingkat kepedasan", icon: "", level: -1 },
  { value: "0", label: "Tidak pedas", desc: "Gurih manis ramah di lidah", icon: "", level: 0 },
  { value: "1", label: "Sedikit pedas", desc: "Hangat rempah bersahabat", icon: "", level: 1 },
  { value: "2", label: "Pedas", desc: "Sensasi cabai yang mantap", icon: "", level: 2 },
  { value: "3", label: "Sangat pedas", desc: "Pedas nendang menggigit", icon: "", level: 3 }
];

let toastTimer = null;
function showToast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => { t.hidden = true; }, 250);
  }, 2400);
}

function renderSpicePips(level) {
  let pips = "";
  for (let i = 1; i <= 3; i++) {
    pips += `<span class="pip ${i <= level ? "active" : ""}"></span>`;
  }
  return `<span class="spice-badge ${SPICE_COLORS[level] || "spice-0"}" title="Tingkat kepedasan: ${SPICE[level]}">
    <span class="pips" aria-hidden="true">${pips}</span>
    <span>${SPICE[level]}</span>
  </span>`;
}

function syncSvgMap() {
  $$("#archipelagoSvg .svg-isl").forEach(g => {
    const isSelected = state.pulau === g.dataset.i;
    g.classList.toggle("on", isSelected);
  });
  $$(".hero-map-backdrop .backdrop-isl").forEach(g => {
    const isSelected = state.pulau === g.dataset.i;
    g.classList.toggle("on", isSelected);
  });
  const btnAll = $("#btnAllIslands");
  if (btnAll) {
    btnAll.hidden = !state.pulau;
  }
}

function renderMap() {
  $("#map").innerHTML = PULAU.map(p => {
    const n = FOODS.filter(f => f.pulau === p).length;
    const isOn = state.pulau === p;
    return `<button type="button" class="isl ${isOn ? "on" : ""}" data-i="${p}" aria-pressed="${isOn}">
      <span class="isl-top">
        <span class="isl-name">${p}</span>
        <span class="isl-count">${n}</span>
      </span>
      <small>${PULAU_SUB[p] || `${n} makanan`}</small>
    </button>`;
  }).join("");
  syncSvgMap();
}

function matchesQuery(f, q) {
  if (!q) return true;
  return (f.nama + " " + f.provinsi + " " + f.pulau + " " + f.bahan.join(" ") + " " + (f.rasa || "")).toLowerCase().includes(q);
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  return FOODS.filter(f =>
    (!state.pulau || f.pulau === state.pulau) &&
    (!state.jenis || f.jenis === state.jenis) &&
    (state.spice === "" || f.spice === +state.spice) &&
    (!state.onlyFav || favs.includes(f.id)) &&
    matchesQuery(f, q)
  );
}

function renderDropdowns() {
  const q = state.q.trim().toLowerCase();

  const menuType = $("#menuType");
  const lblType = $("#lblType");
  const btnType = $("#btnTypeTrigger");
  const activeTypeOpt = TYPE_OPTIONS.find(o => o.value === state.jenis) || TYPE_OPTIONS[0];

  if (lblType) {
    lblType.innerHTML = activeTypeOpt.icon
      ? `<span class="c-trigger-emoji">${activeTypeOpt.icon}</span><span>${activeTypeOpt.label}</span>`
      : `<span>${activeTypeOpt.label}</span>`;
  }
  if (btnType) {
    btnType.classList.toggle("active-filter", Boolean(state.jenis));
  }

  if (menuType) {
    menuType.innerHTML = `
      <div class="c-menu-head">Kategori Hidangan</div>
      ${TYPE_OPTIONS.map(opt => {
        const isSelected = state.jenis === opt.value;
        const count = FOODS.filter(f =>
          (!state.pulau || f.pulau === state.pulau) &&
          (!opt.value || f.jenis === opt.value) &&
          (state.spice === "" || f.spice === +state.spice) &&
          (!state.onlyFav || favs.includes(f.id)) &&
          matchesQuery(f, q)
        ).length;
        return `
          <button type="button" class="c-opt ${isSelected ? "selected" : ""}" role="option" aria-selected="${isSelected}" data-val="${opt.value}">
            <span class="c-opt-text">
              <span class="c-opt-title">${opt.label}</span>
              <span class="c-opt-desc">${opt.desc}</span>
            </span>
            <span class="c-opt-right">
              <span class="c-opt-count">${count}</span>
              <svg class="c-opt-check" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 10.5 8.2 14.5 16 6"/>
              </svg>
            </span>
          </button>`;
      }).join("")}
    `;
  }

  const menuSpice = $("#menuSpice");
  const lblSpice = $("#lblSpice");
  const btnSpice = $("#btnSpiceTrigger");
  const activeSpiceOpt = SPICE_OPTIONS.find(o => o.value === String(state.spice)) || SPICE_OPTIONS[0];

  if (lblSpice) {
    lblSpice.innerHTML = activeSpiceOpt.icon
      ? `<span class="c-trigger-emoji">${activeSpiceOpt.icon}</span><span>${activeSpiceOpt.label}</span>`
      : `<span>${activeSpiceOpt.label}</span>`;
  }
  if (btnSpice) {
    btnSpice.classList.toggle("active-filter", state.spice !== "");
  }

  if (menuSpice) {
    menuSpice.innerHTML = `
      <div class="c-menu-head">Tingkat Kepedasan</div>
      ${SPICE_OPTIONS.map(opt => {
        const isSelected = String(state.spice) === opt.value;
        const count = FOODS.filter(f =>
          (!state.pulau || f.pulau === state.pulau) &&
          (!state.jenis || f.jenis === state.jenis) &&
          (opt.value === "" || f.spice === +opt.value) &&
          (!state.onlyFav || favs.includes(f.id)) &&
          matchesQuery(f, q)
        ).length;

        let miniPips = "";
        if (opt.level >= 0) {
          miniPips = `<span class="c-opt-pips" aria-hidden="true">
            ${[1, 2, 3].map(i => `<i class="${i <= opt.level ? "on" : ""}"></i>`).join("")}
          </span>`;
        }

        return `
          <button type="button" class="c-opt ${isSelected ? "selected" : ""}" role="option" aria-selected="${isSelected}" data-val="${opt.value}">
            <span class="c-opt-text">
              <span class="c-opt-title-row">
                <span class="c-opt-title">${opt.label}</span>
                ${miniPips}
              </span>
              <span class="c-opt-desc">${opt.desc}</span>
            </span>
            <span class="c-opt-right">
              <span class="c-opt-count">${count}</span>
              <svg class="c-opt-check" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 10.5 8.2 14.5 16 6"/>
              </svg>
            </span>
          </button>`;
      }).join("")}
    `;
  }
}

function closeAllDropdowns() {
  $$(".c-dropdown.open").forEach(dd => {
    dd.classList.remove("open");
    const trig = dd.querySelector(".c-trigger");
    if (trig) trig.setAttribute("aria-expanded", "false");
  });
}

function toggleDropdown(ddEl) {
  const isOpen = ddEl.classList.contains("open");
  closeAllDropdowns();
  if (!isOpen) {
    ddEl.classList.add("open");
    const trig = ddEl.querySelector(".c-trigger");
    if (trig) trig.setAttribute("aria-expanded", "true");
  }
}

function toggleFav(id, dishName) {
  const isFav = favs.includes(id);
  favs = isFav ? favs.filter(x => x !== id) : [...favs, id];
  try {
    localStorage.setItem("favs", JSON.stringify(favs));
  } catch (e) {}
  renderGrid();
  if (dishName) {
    showToast(isFav ? `${dishName} dihapus dari favorit` : `${dishName} disimpan ke favorit`);
  }
}

function renderGrid() {
  renderDropdowns();
  const list = filtered();
  const hasFilter = Boolean(state.pulau || state.onlyFav || state.q.trim() || state.jenis || state.spice !== "");
  const label = state.onlyFav
    ? "Koleksi Favoritmu"
    : (state.pulau ? `Kuliner ${state.pulau}` : "Seluruh Nusantara");

  const activeChips = [];
  if (state.pulau) {
    activeChips.push({ key: "pulau", text: `📍 ${state.pulau}` });
  }
  if (state.jenis) {
    const tOpt = TYPE_OPTIONS.find(o => o.value === state.jenis);
    activeChips.push({ key: "jenis", text: `${tOpt ? tOpt.icon : ""} ${state.jenis}` });
  }
  if (state.spice !== "") {
    const sOpt = SPICE_OPTIONS.find(o => o.value === String(state.spice));
    activeChips.push({ key: "spice", text: `${sOpt ? sOpt.icon : "🌶️"} ${SPICE[+state.spice]}` });
  }
  if (state.q.trim()) {
    activeChips.push({ key: "q", text: `🔍 "${state.q.trim()}"` });
  }

  $("#info").innerHTML = `
    <span class="info-main">
      <strong>${label}</strong>
      <span class="info-pill">${list.length} hidangan</span>
      ${activeChips.map(c => `
        <button type="button" class="filter-chip" data-clear="${c.key}" title="Hapus filter ${c.text}">
          <span>${c.text}</span>
          <span class="chip-x" aria-hidden="true">&times;</span>
        </button>
      `).join("")}
    </span>
    ${hasFilter ? `<button type="button" class="link reset-btn" id="reset">Reset filter</button>` : ""}
  `;

  $("#btnFavNav").classList.toggle("active", state.onlyFav);

  $("#grid").innerHTML = list.length
    ? list.map((f, idx) => {
        const isFav = favs.includes(f.id);
        return `
        <article class="card ${f.gambar ? "has-photo" : ""}" data-id="${f.id}" style="--c:${f.warna}; --delay:${idx * 35}ms" tabindex="0" role="button" aria-label="Lihat resep ${f.nama} dari ${f.provinsi}">
          <div class="pic">
            ${f.gambar
              ? `<img src="${f.gambar}" alt="${f.nama}" class="card-hero-img" loading="lazy">
                 <div class="card-hero-gradient" aria-hidden="true"></div>`
              : `<div class="plate-stage">
                  <div class="plate-circle">
                    <span class="dish-emoji" role="img" aria-label="${f.nama}">${f.emoji}</span>
                  </div>
                 </div>`
            }
            <div class="pic-top">
              <span class="prov-badge">
                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
                  <path d="M8 1a5 5 0 0 0-5 5c0 3.75 5 9 5 9s5-5.25 5-9a5 5 0 0 0-5-5zm0 6.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5z"/>
                </svg>
                ${f.provinsi}
              </span>
              <button type="button" class="card-fav ${isFav ? "is-fav" : ""}" data-fav="${f.id}" aria-label="${isFav ? "Hapus dari favorit" : "Simpan ke favorit"}" title="${isFav ? "Hapus dari favorit" : "Simpan ke favorit"}">
                <svg viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="pic-bottom">
              <span class="type-badge">${f.jenis}</span>
              ${f.waktu ? `<span class="time-badge">⏱ ${f.waktu}</span>` : ""}
            </div>
          </div>
          <div class="body">
            <div class="card-region">${f.pulau}${f.rasa ? ` &bull; ${f.rasa}` : ""}</div>
            <h3>${f.nama}</h3>
            <p class="card-excerpt">${f.cerita}</p>
            <div class="card-foot">
              ${renderSpicePips(f.spice)}
              <span class="card-cta">
                Resep
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15" aria-hidden="true">
                  <path d="M5 10h10M11 6l4 4-4 4"/>
                </svg>
              </span>
            </div>
          </div>
        </article>`;
      }).join("")
    : `<div class="empty">
        <div class="empty-icon" aria-hidden="true">🍲</div>
        <h3>Hidangan tidak ditemukan</h3>
        <p>Tidak ada makanan yang cocok dengan filter saat ini. Coba ubah kata kunci pencarian atau tanya Chef AI.</p>
        <button type="button" class="primary" id="emptyReset">Reset Semua Filter</button>
      </div>`;

  const favCountEl = $("#favCount");
  if (favCountEl) favCountEl.textContent = favs.length;
  const emptyReset = $("#emptyReset");
  if (emptyReset) emptyReset.onclick = resetAll;
}

function openFood(id) {
  const f = FOODS.find(x => x.id === id);
  if (!f) return;
  const m = $("#modal");
  const fav = favs.includes(id);

  m.innerHTML = `
    <div class="m-head ${f.gambar ? "has-hero-img" : ""}" style="--c:${f.warna}">
      ${f.gambar
        ? `<img src="${f.gambar}" alt="${f.nama}" class="m-banner-img">
           <div class="m-banner-gradient" aria-hidden="true"></div>`
        : `<div class="m-dish-plate"><span class="e" role="img" aria-label="${f.nama}">${f.emoji}</span></div>`
      }
      <button type="button" class="m-close-icon" id="mCloseTop" aria-label="Tutup jendela resep">&times;</button>
      <div class="m-title-wrap">
        <div class="m-breadcrumb">${f.pulau} &bull; ${f.provinsi}</div>
        <h2 id="modalTitle">${f.nama}</h2>
        <div class="m-tags">
          <span class="tag">${f.jenis}</span>
          ${renderSpicePips(f.spice)}
          ${f.waktu ? `<span class="tag">⏱ ${f.waktu}</span>` : ""}
          ${f.porsi ? `<span class="tag">🍽 ${f.porsi}</span>` : ""}
        </div>
      </div>
    </div>
    <div class="m-body">
      <div class="m-story-box">
        <p>${f.cerita}</p>
      </div>

      <div class="m-recipe-cols">
        <div class="m-col m-ingredients">
          <div class="m-sec-head">
            <h4>Bahan-bahan</h4>
            <span class="m-hint">Klik untuk tandai</span>
          </div>
          <ul class="ing-list">
            ${f.bahan.map(b => `<li tabindex="0" role="checkbox" aria-checked="false"><span class="check-box" aria-hidden="true"></span><span>${b}</span></li>`).join("")}
          </ul>
        </div>

        <div class="m-col m-steps">
          <div class="m-sec-head">
            <h4>Cara Membuat</h4>
            <span class="m-hint">${f.langkah.length} langkah</span>
          </div>
          <ol class="step-list">
            ${f.langkah.map((l, i) => `<li><span class="step-num">${i + 1}</span><span class="step-text">${l}</span></li>`).join("")}
          </ol>
        </div>
      </div>

      <div class="m-actions">
        <button type="button" id="mFav" class="btn-fav-modal ${fav ? "is-fav" : ""}">
          <svg viewBox="0 0 24 24" fill="${fav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" width="18" height="18" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <span>${fav ? "Hapus dari favorit" : "Simpan ke favorit"}</span>
        </button>
        <button type="button" id="mAskAi" class="btn-ask-ai-modal">
          <span></span>
          <span>Tanya Chef AI</span>
        </button>
        <button type="button" id="mCopy" class="btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>Salin Resep</span>
        </button>
        <button type="button" id="mClose" class="btn-close-modal">Tutup</button>
      </div>
    </div>`;

  if (!m.open) m.showModal();

  $("#mClose").onclick = () => m.close();
  $("#mCloseTop").onclick = () => m.close();

  $("#mFav").onclick = () => {
    toggleFav(id, f.nama);
    openFood(id);
  };

  $("#mAskAi").onclick = () => {
    m.close();
    openAiModal(`Berikan tips rahasia memasak ${f.nama} agar anti-gagal, alternatif substitusi bahannya, serta keunikan sejarah budayanya!`);
  };

  $("#mCopy").onclick = async () => {
    const text = `Resep ${f.nama} (${f.provinsi}, ${f.pulau})\n\n${f.cerita}\n\nBahan-bahan:\n${f.bahan.map(b => `- ${b}`).join("\n")}\n\nCara Membuat:\n${f.langkah.map((l, i) => `${i + 1}. ${l}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Resep ${f.nama} berhasil disalin!`);
    } catch (e) {
      showToast("Resep siap disalin");
    }
  };

  m.querySelectorAll(".ing-list li").forEach(li => {
    const toggleItem = () => {
      const checked = li.classList.toggle("done");
      li.setAttribute("aria-checked", checked);
    };
    li.onclick = toggleItem;
    li.onkeydown = e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleItem();
      }
    };
  });
}

function selectIsland(islandName, shouldScroll = true) {
  state.pulau = state.pulau === islandName ? "" : islandName;
  state.onlyFav = false;
  renderMap();
  renderGrid();
  if (shouldScroll && state.pulau) {
    $(".tools-section").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function resetAll() {
  Object.assign(state, { pulau: "", q: "", jenis: "", spice: "", onlyFav: false });
  $("#search").value = "";
  $("#fType").value = "";
  $("#fSpice").value = "";
  const clearBtn = $("#btnClearSearch");
  if (clearBtn) clearBtn.hidden = true;
  closeAllDropdowns();
  renderMap();
  renderGrid();
}

$("#map").addEventListener("click", e => {
  const b = e.target.closest(".isl");
  if (!b) return;
  selectIsland(b.dataset.i);
});

$("#map").addEventListener("mouseover", e => {
  const b = e.target.closest(".isl");
  $$("#archipelagoSvg .svg-isl").forEach(g => {
    g.classList.toggle("hover", Boolean(b && g.dataset.i === b.dataset.i));
  });
  $$(".hero-map-backdrop .backdrop-isl").forEach(g => {
    g.classList.toggle("hover", Boolean(b && g.dataset.i === b.dataset.i));
  });
});

$("#map").addEventListener("mouseleave", () => {
  $$("#archipelagoSvg .svg-isl").forEach(g => g.classList.remove("hover"));
  $$(".hero-map-backdrop .backdrop-isl").forEach(g => g.classList.remove("hover"));
});

const svgMap = $("#archipelagoSvg");
if (svgMap) {
  svgMap.addEventListener("click", e => {
    const g = e.target.closest(".svg-isl");
    if (!g) return;
    selectIsland(g.dataset.i);
  });
  svgMap.addEventListener("mouseover", e => {
    const g = e.target.closest(".svg-isl");
    $$("#map .isl").forEach(b => {
      b.classList.toggle("hover", Boolean(g && b.dataset.i === b.dataset.i));
    });
    $$(".hero-map-backdrop .backdrop-isl").forEach(g => {
      g.classList.toggle("hover", Boolean(g && b.dataset.i === g.dataset.i));
    });
  });
  svgMap.addEventListener("mouseleave", () => {
    $$("#map .isl").forEach(b => b.classList.remove("hover"));
    $$(".hero-map-backdrop .backdrop-isl").forEach(g => g.classList.remove("hover"));
  });
}

const btnAllIslands = $("#btnAllIslands");
if (btnAllIslands) {
  btnAllIslands.addEventListener("click", () => {
    state.pulau = "";
    renderMap();
    renderGrid();
  });
}

function setActiveNav(navKey) {
  $$(".nav-link").forEach(l => {
    l.classList.toggle("active", l.dataset.nav === navKey);
  });
}

const navMenu = $("#navMenu");
const btnMobileNav = $("#btnMobileNav");

function closeMobileNav() {
  if (navMenu && navMenu.classList.contains("open")) {
    navMenu.classList.remove("open");
    btnMobileNav?.setAttribute("aria-expanded", "false");
    btnMobileNav?.classList.remove("active");
  }
}

function toggleMobileNav(e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  if (!navMenu) return;
  const isOpen = navMenu.classList.toggle("open");
  if (btnMobileNav) {
    btnMobileNav.setAttribute("aria-expanded", String(isOpen));
    btnMobileNav.classList.toggle("active", isOpen);
  }
}

// Expose globally for inline onclick handlers
window.closeMobileNav = closeMobileNav;
window.toggleMobileNav = toggleMobileNav;

if (btnMobileNav) {
  btnMobileNav.onclick = toggleMobileNav;
}

$$(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    const target = link.dataset.nav;
    if (target === "ai") {
      e.preventDefault();
      openAiModal();
      closeMobileNav();
      return;
    }
    if (target === "beranda") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      closeMobileNav();
      setActiveNav("beranda");
      return;
    }
    if (target === "peta") {
      e.preventDefault();
      $("#mapSection")?.scrollIntoView({ behavior: "smooth" });
      closeMobileNav();
      setActiveNav("peta");
      return;
    }
    if (target === "koleksi") {
      e.preventDefault();
      $("#koleksiSection")?.scrollIntoView({ behavior: "smooth" });
      closeMobileNav();
      setActiveNav("koleksi");
      return;
    }
    if (target === "tentang") {
      e.preventDefault();
      $("#tentangSection")?.scrollIntoView({ behavior: "smooth" });
      closeMobileNav();
      setActiveNav("tentang");
      return;
    }
    closeMobileNav();
  });
});

document.addEventListener("click", (e) => {
  if (navMenu?.classList.contains("open")) {
    const clickedInsideMenu = navMenu.contains(e.target);
    const clickedInsideBtn = btnMobileNav ? (btnMobileNav === e.target || btnMobileNav.contains(e.target)) : false;
    if (!clickedInsideMenu && !clickedInsideBtn) {
      closeMobileNav();
    }
  }
});

// Scrollspy for active navbar indicator
window.addEventListener("scroll", () => {
  const scrollPos = window.scrollY + 140;
  const sections = [
    { id: "tentangSection", key: "tentang" },
    { id: "koleksiSection", key: "koleksi" },
    { id: "mapSection", key: "peta" }
  ];
  let currentKey = "beranda";
  for (const sec of sections) {
    const el = document.getElementById(sec.id);
    if (el && scrollPos >= el.offsetTop) {
      currentKey = sec.key;
      break;
    }
  }
  setActiveNav(currentKey);
}, { passive: true });

const brandHome = $("#brandHome");
if (brandHome) {
  brandHome.addEventListener("click", e => {
    e.preventDefault();
    resetAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveNav("beranda");
  });
}

$("#grid").addEventListener("click", e => {
  const favBtn = e.target.closest(".card-fav");
  if (favBtn) {
    e.stopPropagation();
    const id = +favBtn.dataset.fav;
    const dish = FOODS.find(x => x.id === id);
    toggleFav(id, dish ? dish.nama : "");
    return;
  }
  const c = e.target.closest(".card");
  if (c) openFood(+c.dataset.id);
});

$("#grid").addEventListener("keydown", e => {
  if (e.target.closest(".card-fav")) return;
  const c = e.target.closest(".card");
  if (c && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openFood(+c.dataset.id);
  }
});

$("#info").addEventListener("click", e => {
  if (e.target.id === "reset") {
    resetAll();
    return;
  }
  const chip = e.target.closest(".filter-chip");
  if (chip) {
    const key = chip.dataset.clear;
    if (key === "pulau") {
      state.pulau = "";
      renderMap();
    } else if (key === "jenis") {
      state.jenis = "";
      $("#fType").value = "";
    } else if (key === "spice") {
      state.spice = "";
      $("#fSpice").value = "";
    } else if (key === "q") {
      state.q = "";
      $("#search").value = "";
      const clearBtn = $("#btnClearSearch");
      if (clearBtn) clearBtn.hidden = true;
    }
    renderGrid();
  }
});

$("#search").addEventListener("input", e => {
  state.q = e.target.value;
  const clearBtn = $("#btnClearSearch");
  if (clearBtn) clearBtn.hidden = !state.q.length;
  renderGrid();
});

const btnClearSearch = $("#btnClearSearch");
if (btnClearSearch) {
  btnClearSearch.addEventListener("click", () => {
    state.q = "";
    $("#search").value = "";
    btnClearSearch.hidden = true;
    $("#search").focus();
    renderGrid();
  });
}

const ddType = $("#ddType");
const ddSpice = $("#ddSpice");

if (ddType) {
  $("#btnTypeTrigger").addEventListener("click", e => {
    e.stopPropagation();
    toggleDropdown(ddType);
  });
  $("#menuType").addEventListener("click", e => {
    const opt = e.target.closest(".c-opt");
    if (!opt) return;
    state.jenis = opt.dataset.val;
    $("#fType").value = state.jenis;
    closeAllDropdowns();
    renderGrid();
  });
}

if (ddSpice) {
  $("#btnSpiceTrigger").addEventListener("click", e => {
    e.stopPropagation();
    toggleDropdown(ddSpice);
  });
  $("#menuSpice").addEventListener("click", e => {
    const opt = e.target.closest(".c-opt");
    if (!opt) return;
    state.spice = opt.dataset.val;
    $("#fSpice").value = state.spice;
    closeAllDropdowns();
    renderGrid();
  });
}

document.addEventListener("click", e => {
  if (!e.target.closest(".c-dropdown")) {
    closeAllDropdowns();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeAllDropdowns();
  }
});

$("#fType").addEventListener("change", e => {
  state.jenis = e.target.value;
  renderGrid();
});

$("#fSpice").addEventListener("change", e => {
  state.spice = e.target.value;
  renderGrid();
});

$("#btnFavNav").addEventListener("click", () => {
  state.onlyFav = !state.onlyFav;
  state.pulau = "";
  renderMap();
  renderGrid();
});

$("#modal").addEventListener("click", e => {
  if (e.target.id === "modal") e.target.close();
});

function updateThemeUI() {
  const isDark = document.documentElement.dataset.theme === "dark";
  const label = $(".theme-label");
  if (label) label.textContent = isDark ? "Gelap" : "Terang";
}

$("#btnTheme").addEventListener("click", () => {
  const r = document.documentElement;
  const d = r.dataset.theme === "dark";
  r.dataset.theme = d ? "light" : "dark";
  updateThemeUI();
  try {
    localStorage.setItem("theme", r.dataset.theme);
  } catch (e) {}
});

try {
  const t = localStorage.getItem("theme");
  if (t) document.documentElement.dataset.theme = t;
} catch (e) {}

const statTotal = $("#statTotal");
const statProv = $("#statProv");
if (statTotal) statTotal.textContent = FOODS.length;
if (statProv) statProv.textContent = new Set(FOODS.map(f => f.provinsi)).size;

/* ==========================================================================
   CHEF NUSANTARA AI — LLM API INTEGRATION (Gemini / Groq / OpenAI) + FALLBACK
   ========================================================================== */

const DEFAULT_MODELS = {
  gemini: "gemini-1.5-flash",
  groq: "llama-3.3-70b-versatile",
  openai: "gpt-4o-mini"
};

const PROVIDER_NAMES = {
  gemini: "Google Gemini",
  groq: "Groq Cloud",
  openai: "OpenAI"
};

const AI_CAPABILITY_PROMPTS = {
  mood: [
    { label: "Cuaca hujan dingin", prompt: "Cuaca sedang hujan dan dingin, rekomendasikan makanan Nusantara berkuah hangat yang paling cocok beserta alasannya!" },
    { label: "Pengen yang pedas nendang", prompt: "Aku lagi pengen makan yang pedas nendang dan kaya rempah. Apa rekomendasi terbaikmu?" },
    { label: "Segar untuk siang terik", prompt: "Siang hari sedang panas terik, rekomendasikan minuman atau camilan segar khas Nusantara!" },
    { label: "Gurih manis tidak pedas", prompt: "Rekomendasikan hidangan Nusantara yang gurih atau manis legit dan sama sekali tidak pedas." }
  ],
  bahan: [
    { label: "Punya ayam, cabai & tomat", prompt: "Di dapurku ada ayam, cabai, bawang putih, dan tomat. Enaknya dimasak jadi hidangan Nusantara apa?" },
    { label: "Daging sapi & santan", prompt: "Aku punya daging sapi, santan, dan bumbu rempah di rumah. Bisa dimasak jadi menu apa saja?" },
    { label: "Ikan segar & jeruk nipis", prompt: "Ada ikan segar, kunyit, serai, dan jeruk nipis di kulkas. Cocoknya dibuat masakan khas mana?" },
    { label: "Sayuran, jagung & beras", prompt: "Punya beras, jagung manis, labu, dan sayuran hijau. Masak apa yang sehat dan khas Nusantara?" }
  ],
  tips: [
    { label: "Tips Rendang empuk & meresap", prompt: "Bagaimana tips rahasia memasak Rendang agar daging sapi cepat empuk, tidak hancur, dan bumbu hitamnya meresap sempurna?" },
    { label: "Substitusi kluwek pada Rawon", prompt: "Kalau ingin masak Rawon tapi tidak menemukan kluwek, apakah ada bahan substitusi dan bagaimana tips memilih kluwek yang tidak pahit?" },
    { label: "Cara buat Papeda anti-gagal", prompt: "Bagaimana trik menyeduh tepung sagu untuk Papeda agar matang bening sempurna dan tidak menggumpal?" },
    { label: "Tips Pempek lembut & tidak keras", prompt: "Apa rahasia menguleni adonan Pempek ikan tenggiri dan sagu supaya teksturnya kenyal lembut dan tidak alot?" }
  ],
  budaya: [
    { label: "Pilihkan Menu Kejutan!", prompt: "KEJUTAN_MENU" },
    { label: "Filosofi Gudeg Yogyakarta", prompt: "Ceritakan sejarah dan makna filosofi budaya di balik kuliner Gudeg khas Yogyakarta!" },
    { label: "Rahasia Base Genep Bali", prompt: "Apa itu bumbu Base Genep pada Ayam Betutu Bali dan bagaimana tradisi penyajiannya di Pulau Dewata?" },
    { label: "Kisah Rempah Maluku & Aceh", prompt: "Bagaimana jejak jalur rempah Nusantara mempengaruhi cita rasa Mie Aceh dan Colo-colo Maluku?" }
  ]
};

let aiConfig = {
  provider: "gemini",
  model: "gemini-1.5-flash",
  apiKey: ""
};

try {
  const savedCfg = JSON.parse(localStorage.getItem("nusantara_ai_cfg") || "null");
  if (savedCfg && typeof savedCfg === "object") {
    let savedModel = savedCfg.model || DEFAULT_MODELS[savedCfg.provider || "gemini"];
    // Automatically migrate legacy or overloaded models to stable gemini-1.5-flash
    if ((savedCfg.provider === "gemini" || !savedCfg.provider) && (savedModel === "gemini-2.5-flash" || savedModel === "gemini-2.0-flash" || !savedModel)) {
      savedModel = "gemini-1.5-flash";
    }
    aiConfig = {
      provider: savedCfg.provider || "gemini",
      model: savedModel,
      apiKey: (savedCfg.apiKey || "").trim()
    };
    try {
      localStorage.setItem("nusantara_ai_cfg", JSON.stringify(aiConfig));
    } catch (e) {}
  }
} catch (e) {}

let aiChatHistory = [];
let activeCapTab = "mood";

function buildSystemPrompt() {
  const catalogSummary = FOODS.map(f =>
    `- [ID:${f.id}] ${f.nama} (${f.provinsi}, ${f.pulau}) | Jenis: ${f.jenis} | Level Pedas: ${SPICE[f.spice]} (${f.spice}/3) | Waktu: ${f.waktu} | Karakter Rasa: ${f.rasa} | Bahan: ${f.bahan.join(", ")} | Cerita: ${f.cerita} | Langkah: ${f.langkah.join(" -> ")}`
  ).join("\n");

  return `Kamu adalah "Chef Nusantara AI", juru masak ahli, sejarawan gastronomi, dan asisten kuliner resmi pada web "Rasa Nusantara".
Gaya bahasamu: Hangat, ramah, menggugah selera, terstruktur rapi, dan bangga akan kekayaan rempah Indonesia.

Tugas utamamu mencakup 4 kemampuan:
1. Rekomendasi pintar sesuai mood, cuaca, atau selera rasa pengunjung.
2. Mencocokkan resep dari bahan yang dimiliki pengunjung di dapur/kulkas.
3. Menjawab tanya jawab langkah memasak, substitusi bahan pengganti, dan tips anti-gagal.
4. Menceritakan kisah budaya, filosofi sejarah hidangan, serta memberikan ide kejutan menu acak.

Katalog Hidangan Rasa Nusantara yang tersedia di web ini:
${catalogSummary}

Aturan Penting:
- Jawab selalu dalam Bahasa Indonesia yang jelas dan mudah dipahami.
- Gunakan format **teks tebal** untuk nama makanan dan poin penting, serta gunakan daftar bullet (-) bila menjabarkan bahan atau tips.
- Setiap kali kamu merekomendasikan atau membahas hidangan yang ada di katalog di atas, sebutkan nama hidangannya secara persis (misal: **Rendang**, **Soto Betawi**, **Papeda & Ikan Kuah Kuning**, dll.) agar sistem UI web otomatis menampilkan Kartu Resep Interaktif di bawah jawabanmu.`;
}

const CHEF_AVATAR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`;

function updateAiStatusBadge() {
  const badge = $("#aiStatusBadge");
  if (!badge) return;
  if (aiConfig.apiKey && aiConfig.apiKey.trim().length > 5) {
    badge.textContent = `${PROVIDER_NAMES[aiConfig.provider] || "LLM"} Aktif`;
    badge.classList.add("connected");
  } else {
    badge.textContent = "Mode Pintar (Siap Pakai)";
    badge.classList.remove("connected");
  }
}

function renderCapPrompts() {
  const container = $("#aiQuickPrompts");
  if (!container) return;
  const list = AI_CAPABILITY_PROMPTS[activeCapTab] || [];
  container.innerHTML = list.map((item, idx) => `
    <button type="button" class="ai-prompt-chip" data-idx="${idx}">
      <span>${item.label}</span>
    </button>
  `).join("");
}

function formatAiMarkdown(rawText) {
  const escaped = rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  let html = "";
  let inList = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }

    const formattedInline = trimmed
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

    if (/^[-•*]\s+/.test(trimmed)) {
      if (!inList) {
        html += '<ul class="ai-md-list">';
        inList = true;
      }
      html += `<li>${formattedInline.replace(/^[-•*]\s+/, "")}</li>`;
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        html += '<ul class="ai-md-list numbered">';
        inList = true;
      }
      html += `<li>${formattedInline}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${formattedInline}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

function extractMentionedFoods(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const f of FOODS) {
    const baseName = f.nama.toLowerCase().split("(")[0].trim();
    const shortKey = f.id === 14 ? "papeda" : baseName;
    if (lower.includes(f.nama.toLowerCase()) || lower.includes(shortKey)) {
      found.push(f);
    }
  }
  return found.slice(0, 3);
}

function renderAiChat() {
  const listEl = $("#aiChatList");
  if (!listEl) return;

  if (!aiChatHistory.length) {
    listEl.innerHTML = `
      <div class="ai-msg assistant welcome">
        <div class="ai-msg-avatar" aria-hidden="true">${CHEF_AVATAR_SVG}</div>
        <div class="ai-msg-bubble">
          <div class="ai-msg-content">
            <p><strong>Halo! Selamat datang di Dapur Chef Nusantara AI.</strong></p>
            <p>Saya siap membantu Anda menjelajahi cita rasa kuliner Indonesia melalui 4 keahlian utama:</p>
            <ul class="ai-md-list">
              <li><strong>Rekomendasi Mood &amp; Cuaca:</strong> Cari hidangan berkuah hangat saat hujan, pedas menggigit, atau penyegar dahaga.</li>
              <li><strong>Cocokkan Bahan di Dapur:</strong> Sebutkan bahan yang ada di kulkas (misal: <em>"ayam, santan, cabai"</em>), saya carikan resep yang pas.</li>
              <li><strong>Tips &amp; Substitusi Bahan:</strong> Tanya trik memasak anti-gagal atau pengganti bumbu langka seperti kluwek dan base genep.</li>
              <li><strong>Cerita Budaya &amp; Kejutan Menu:</strong> Kenali sejarah di balik hidangan atau klik tombol <strong>Kejutkan Menu</strong>!</li>
            </ul>
            <p class="ai-welcome-foot">Pilih topik di atas atau ketik pertanyaan Anda di bawah.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = aiChatHistory.map(msg => {
    if (msg.role === "user") {
      return `
        <div class="ai-msg user">
          <div class="ai-msg-bubble">
            <div class="ai-msg-content"><p>${msg.content.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p></div>
          </div>
        </div>
      `;
    }

    if (msg.loading) {
      return `
        <div class="ai-msg assistant loading">
          <div class="ai-msg-avatar" aria-hidden="true">${CHEF_AVATAR_SVG}</div>
          <div class="ai-msg-bubble">
            <div class="ai-typing">
              <span></span><span></span><span></span>
              <em>Chef Nusantara sedang meracik jawaban...</em>
            </div>
          </div>
        </div>
      `;
    }

    const matchedFoods = msg.foods || extractMentionedFoods(msg.content);
    const cardsHtml = matchedFoods.length
      ? `<div class="ai-dish-cards">
          ${matchedFoods.map(f => `
            <div class="ai-mini-card" style="--c:${f.warna}">
              <div class="ai-mini-left">
                ${f.gambar
                  ? `<img src="${f.gambar}" alt="${f.nama}" class="ai-mini-img">`
                  : `<span class="ai-mini-badge" style="background:${f.warna};width:10px;height:10px;border-radius:50%;display:inline-block;"></span>`
                }
                <div>
                  <strong>${f.nama}</strong>
                  <small>${f.provinsi} &bull; ${SPICE[f.spice]} &bull; ${f.waktu}</small>
                </div>
              </div>
              <div class="ai-mini-actions">
                <button type="button" class="ai-mini-btn primary-mini" data-open-food="${f.id}">Buka Resep</button>
                <button type="button" class="ai-mini-btn" data-ask-tips="${f.nama}">Tips</button>
              </div>
            </div>
          `).join("")}
        </div>`
      : "";

    const sourceTag = msg.source
      ? `<div class="ai-msg-meta"><span>${msg.source}</span>${!aiConfig.apiKey ? `<button type="button" class="ai-meta-link" data-open-settings="1">Hubungkan API Key LLM</button>` : ""}</div>`
      : "";

    return `
      <div class="ai-msg assistant">
        <div class="ai-msg-avatar" aria-hidden="true">${CHEF_AVATAR_SVG}</div>
        <div class="ai-msg-bubble">
          <div class="ai-msg-content">${formatAiMarkdown(msg.content)}</div>
          ${cardsHtml}
          ${sourceTag}
        </div>
      </div>
    `;
  }).join("");

  listEl.scrollTop = listEl.scrollHeight;
}

/* Smart Local Culinary Fallback Engine (4 Capabilities) */
function generateSmartLocalResponse(userText) {
  const q = userText.toLowerCase();

  // 4. Kejutan Menu Acak
  if (userText === "KEJUTAN_MENU" || q.includes("kejut") || q.includes("acak") || q.includes("random")) {
    const pick = FOODS[Math.floor(Math.random() * FOODS.length)];
    return {
      text: `🎉 **Kejutan Menu Nusantara Hari Ini: ${pick.nama}!**\n\nHidangan istimewa dari **${pick.provinsi} (${pick.pulau})** ini memiliki karakter rasa **${pick.rasa}**.\n\n**Mengapa wajib dicoba?**\n${pick.cerita}\n\n- **Kategori:** ${pick.jenis} (${SPICE[pick.spice]})\n- **Estimasi Waktu:** ${pick.waktu} untuk ${pick.porsi}\n- **Bahan Utama:** ${pick.bahan.slice(0, 4).join(", ")}\n\nKlik tombol **Buka Resep** di bawah untuk mulai memasak!`,
      foods: [pick]
    };
  }

  // 3. Tips Memasak & Substitusi Bahan
  if (q.includes("tips") || q.includes("substitusi") || q.includes("ganti") || q.includes("kluwek") || q.includes("empuk") || q.includes("menggumpal") || q.includes("anti-gagal") || q.includes("rahasia")) {
    if (q.includes("rendang")) {
      const f = FOODS.find(x => x.id === 2);
      return {
        text: ` **Rahasia Memasak Rendang Daging Empuk & Bumbu Meresap:**\n\n- **Pilih Potongan Sengkel atau Paha Belakang:** Serat dagingnya tidak mudah hancur meski dimasak 3–4 jam.\n- **Santan Perasan Pertama:** Gunakan santan kental asli agar keluar minyak alami (*minyak makan*) saat proses *dedak*.\n- **Api Kecil & Sabar Mengaduk:** Masak dengan api kecil saat kuah mulai mengental agar bagian dasar wajan tidak gosong.\n- **Substitusi Bahan:** Jika sulit mendapat kelapa parut tua untuk kerisik, sangrai kelapa parut kering hingga kecokelatan lalu tumbuk halus.`,
        foods: f ? [f] : []
      };
    }
    if (q.includes("rawon") || q.includes("kluwek")) {
      const f = FOODS.find(x => x.id === 6);
      return {
        text: ` **Tips Memilih Kluwek & Substitusi untuk Rawon:**\n\n- **Cara Pilih Kluwek Anti-Pahit:** Kocok biji kluwek sebelum dibuka; pilih yang terasa berat dan tidak berbunyi nyaring. Cicipi sedikit ujung daging bijinya untuk memastikan tidak pahit.\n- **Rendam Air Hangat:** Lumatkan isi kluwek dengan sedikit air hangat sebelum ditumis bersama bawang dan kunyit.\n- **Substitusi Darurat:** Jika kluwek benar-benar tidak tersedia, Anda dapat mencampurkan sedikit **pasta wijen hitam + kecap manis + kemiri sangrai** untuk warna gelap dan tekstur gurih, meski aroma khas kluwek tetap paling autentik.`,
        foods: f ? [f] : []
      };
    }
    if (q.includes("papeda") || q.includes("sagu")) {
      const f = FOODS.find(x => x.id === 14);
      return {
        text: ` **Trik Membuat Papeda Bening & Tidak Menggumpal:**\n\n- **Larutkan dengan Air Dingin Dulu:** Jangan langsung menuang air mendidih ke tepung sagu kering! Larutkan dulu sagu dengan sedikit air dingin dan perasan jeruk nipis hingga rata.\n- **Air Harus Benar-Benar Mendidih (100°C):** Tuang air yang sedang bergolak sambil diaduk cepat dan searah hingga warna putih susu berubah menjadi bening seperti lem.\n- **Substitusi Bahan:** Bila tepung sagu asli Papua/Maluku sulit didapat, gunakan **tepung tapioka kualitas baik** dengan perbandingan air panas yang sama.`,
        foods: f ? [f] : []
      };
    }
    if (q.includes("pempek")) {
      const f = FOODS.find(x => x.id === 3);
      return {
        text: ` **Rahasia Adonan Pempek Lembut & Tidak Alot:**\n\n- **Gunakan Air Es Dingin:** Air es menjaga protein ikan tetap kenyal saat dicampur garam.\n- **Jangan Diuleni Terlalu Lama Setelah Sagu Masuk:** Begitu tepung sagu masuk, cukup aduk balik perlahan dengan spatula atau ujung jari agar pempek tidak keras saat dingin.\n- **Substitusi Ikan:** Selain ikan tenggiri, Anda bisa memakai **ikan gabus** atau **ikan kakap** dengan hasil yang sama gurihnya!`,
        foods: f ? [f] : []
      };
    }

    const matchedDish = extractMentionedFoods(userText)[0];
    if (matchedDish) {
      return {
        text: ` **Tips Rahasia & Substitusi Memasak ${matchedDish.nama} (${matchedDish.provinsi}):**\n\n- **Kunci Cita Rasa (${matchedDish.rasa}):** Tumis bumbu halus hingga benar-benar matang dan pecah minyak agar tidak langu.\n- **Bahan Utama:** Pastikan ${matchedDish.bahan.slice(0, 3).join(", ")} dalam kondisi segar.\n- **Tips Penyajian:** Ikuti ${matchedDish.langkah.length} langkah pembuatan secara berurutan (waktu masak sekitar **${matchedDish.waktu}**).\n- ** Filosofi Singkat:** ${matchedDish.cerita}`,
        foods: [matchedDish]
      };
    }
  }

  // 4. Cerita Budaya & Sejarah
  if (q.includes("cerita") || q.includes("sejarah") || q.includes("filosofi") || q.includes("budaya") || q.includes("base genep") || q.includes("asal")) {
    const matched = extractMentionedFoods(userText);
    if (matched.length) {
      const f = matched[0];
      return {
        text: `**Kisah Budaya & Filosofi ${f.nama} (${f.provinsi}, ${f.pulau}):**\n\n${f.cerita}\n\n- **Karakter Rasa:** ${f.rasa} (${SPICE[f.spice]})\n- **Warisan Rempah:** Mengandalkan perpaduan **${f.bahan.join(", ")}** yang mencerminkan kekayaan alam ${f.pulau}.\n- **Tradisi Kuliner:** Hidangan ini menjadi simbol kehangatan keluarga dan identitas budaya masyarakat ${f.provinsi}.`,
        foods: matched
      };
    }
  }

  // 1. Mood & Cuaca
  if (q.includes("hujan") || q.includes("dingin") || q.includes("kuah") || q.includes("hangat")) {
    const picks = FOODS.filter(f => [4, 6, 7, 11, 12, 13].includes(f.id)).slice(0, 3);
    return {
      text: `**Rekomendasi Hidangan Berkuah Hangat Saat Hujan / Dingin:**\n\nSaat udara dingin, tubuh paling cocok disambut kaldu rempah yang hangat:\n\n- **Soto Betawi (DKI Jakarta):** Kuah santan/susu yang *creamy* dengan aroma pala dan kayu manis.\n- **Rawon (Jawa Timur):** Sup daging berkuah hitam kluwek yang gurih dalam.\n- **Soto Banjar (Kalimantan Selatan):** Kuah bening harum cengkeh dan kayu manis yang menenangkan.`,
      foods: picks
    };
  }

  if (q.includes("panas") || q.includes("terik") || q.includes("segar") || q.includes("minum") || q.includes("camilan")) {
    const picks = FOODS.filter(f => [8, 3, 15].includes(f.id));
    return {
      text: `**Rekomendasi Penyegar & Kudapan Saat Cuaca Terik:**\n\n- **Es Cendol (Jawa Barat):** Perpaduan es serut, cendol pandan, santan gurih, dan sirup gula merah yang langsung menyejukkan tenggorokan.\n- **Pempek (Sumatera Selatan):** Camilan ikan tenggiri dengan kuah cuko asam-manis-pedas yang membangkitkan semangat.\n- **Colo-colo (Maluku):** Sambal jeruk nipis dan tomat hijau segar pendamping ikan bakar.`,
      foods: picks
    };
  }

  if (q.includes("pedas") || q.includes("nendang") || q.includes("cabai")) {
    const picks = FOODS.filter(f => f.spice >= 2).slice(0, 3);
    return {
      text: `**Rekomendasi Hidangan Pedas Menggigit Kaya Rempah:**\n\nBagi pencinta sensasi cabai dan rempah kuat, tiga hidangan ini wajib Anda coba:\n\n- **Mie Aceh (Aceh):** Mie tebal dengan bumbu kari rempah dan cabai yang kaya rasa.\n- **Ayam Taliwang (NTB):** Ayam kampung bakar dengan sambal cabai rawit dan terasi khas Lombok.\n- **Rendang (Sumatera Barat):** Daging sapi dimasak lama dengan santan dan cabai merah hingga meresap sempurna.`,
      foods: picks
    };
  }

  if (q.includes("tidak pedas") || q.includes("manis") || q.includes("anak")) {
    const picks = FOODS.filter(f => f.spice === 0).slice(0, 3);
    return {
      text: `**Rekomendasi Hidangan Gurih & Manis Legit (Tidak Pedas):**\n\nCocok untuk seluruh anggota keluarga yang menyukai cita rasa lembut kaya rempah:\n\n- **Gudeg (DI Yogyakarta):** Nangka muda dimasak santan dan gula jawa hingga manis legit.\n- **Soto Betawi (DKI Jakarta):** Soto daging gurih beraroma rempah pala dan kayu manis.\n- **Soto Banjar (Kalimantan Selatan):** Soto ayam berkuah bening harum dengan perkedel dan soun.`,
      foods: picks
    };
  }

  // 2. Pencocokan Bahan di Dapur
  const tokens = q.split(/[\s,./;!?-]+/).filter(w => w.length >= 3);
  const scored = FOODS.map(f => {
    const haystack = (f.nama + " " + f.bahan.join(" ") + " " + f.rasa + " " + f.jenis + " " + f.pulau).toLowerCase();
    let score = 0;
    for (const tk of tokens) {
      if (haystack.includes(tk)) score += 2;
    }
    return { food: f, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    const topFoods = scored.slice(0, 3).map(x => x.food);
    return {
      text: `**Rekomendasi Hidangan Berdasarkan Bahan / Kata Kunci Anda:**\n\nBerdasarkan kecocokan bahan dan selera yang Anda sebutkan, berikut hidangan Nusantara yang paling pas untuk dimasak:\n\n${topFoods.map(f => `- **${f.nama} (${f.provinsi}):** Membutuhkan *${f.bahan.join(", ")}*. Waktu masak sekitar ${f.waktu}.`).join("\n")}\n\nKlik kartu resep di bawah untuk melihat takaran dan langkah pembuatannya!`,
      foods: topFoods
    };
  }

  // Default helpful response with top picks
  const sample = [FOODS[1], FOODS[3], FOODS[13]];
  return {
    text: ` **Saran Chef Nusantara AI:**\n\nSaya bisa membantu Anda memilih dari **${FOODS.length} resep autentik Nusantara**! Berikut 3 hidangan favorit dari barat hingga timur Indonesia yang bisa Anda coba hari ini:\n\n- **Rendang (Sumatera Barat):** Mahakarya daging sapi bersantan dan rempah.\n- **Soto Betawi (DKI Jakarta):** Kuah santan gurih hangat yang kaya aroma rempah.\n- **Papeda & Ikan Kuah Kuning (Papua):** Perpaduan sagu kenyal dan kuah ikan kunyit jeruk nipis yang segar.\n\nCoba sebutkan **bahan yang ada di kulkas Anda** (misal: *ayam, santan, cabai*) atau **suasana hati Anda** saat ini!`,
    foods: sample
  };
}

async function callLlmApi(userPrompt) {
  const provider = aiConfig.provider;
  const apiKey = (aiConfig.apiKey || "").trim().replace(/^["']|["']$/g, "");
  let model = (aiConfig.model || DEFAULT_MODELS[provider] || "gemini-1.5-flash").trim();
  if (provider === "gemini" && (model === "gemini-2.5-flash" || !model)) {
    model = "gemini-1.5-flash";
  }
  const cleanModel = model.replace(/^models\//, "");
  const sysPrompt = buildSystemPrompt();

  const recentTurns = aiChatHistory
    .filter(m => !m.loading && m.content)
    .slice(-6);

  if (provider === "gemini") {
    const sanitizedContents = [];
    let lastRole = null;
    for (const m of recentTurns) {
      const role = m.role === "assistant" ? "model" : "user";
      if (!sanitizedContents.length && role !== "user") {
        continue;
      }
      if (role === lastRole) {
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += "\n\n" + m.content;
      } else {
        sanitizedContents.push({
          role,
          parts: [{ text: m.content }]
        });
        lastRole = role;
      }
    }

    if (!sanitizedContents.length) {
      sanitizedContents.push({
        role: "user",
        parts: [{ text: userPrompt }]
      });
    }

    const payload = {
      systemInstruction: { parts: [{ text: sysPrompt }] },
      contents: sanitizedContents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
    };

    async function sendGeminiRequest(targetModel) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.raw = errData;
        throw err;
      }
      return await res.json();
    }

    let activeModel = cleanModel;
    let switchedModel = false;
    let data;

    try {
      data = await sendGeminiRequest(activeModel);
    } catch (err) {
      const isOverloaded =
        err.status === 503 ||
        err.status === 429 ||
        /high demand|spikes in demand|overloaded|resource exhausted|unavailable/i.test(err.message || "");

      // If server is experiencing high demand / unavailable, auto-retry with stable gemini-1.5-flash
      if (isOverloaded && activeModel !== "gemini-1.5-flash") {
        console.warn(`Model ${activeModel} mengalami lonjakan beban di Google Gemini. Mengalihkan otomatis ke gemini-1.5-flash...`);
        try {
          data = await sendGeminiRequest("gemini-1.5-flash");
          activeModel = "gemini-1.5-flash";
          switchedModel = true;
          // Auto-update saved config so next questions use 1.5-flash directly
          aiConfig.model = "gemini-1.5-flash";
          try {
            localStorage.setItem("nusantara_ai_cfg", JSON.stringify(aiConfig));
          } catch (e) {}
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      } else {
        throw err;
      }
    }

    const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!reply) throw new Error("Respons kosong dari Gemini API");
    return {
      text: reply,
      source: switchedModel
        ? `Google Gemini (gemini-1.5-flash - dialihkan otomatis dari ${cleanModel} karena server Google sedang penuh)`
        : `Google Gemini (${activeModel})`
    };
  }

  // OpenAI or Groq (OpenAI-compatible chat completions)
  const endpoint = provider === "groq"
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const messages = [
    { role: "system", content: sysPrompt },
    ...recentTurns.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    }))
  ];

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: cleanModel,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content || "";
  if (!reply) throw new Error("Respons kosong dari API");
  return {
    text: reply,
    source: `${PROVIDER_NAMES[provider]} (${cleanModel})`
  };
}

async function sendAiPrompt(rawPrompt) {
  const isSurprise = rawPrompt === "KEJUTAN_MENU";
  const displayUserText = isSurprise
    ? "Kejutkan aku dengan 1 rekomendasi menu Nusantara acak beserta cerita dan alasan spesialnya!"
    : rawPrompt.trim();

  if (!displayUserText) return;

  aiChatHistory.push({ role: "user", content: displayUserText });
  aiChatHistory.push({ role: "assistant", loading: true, content: "" });
  renderAiChat();

  const hasKey = Boolean(aiConfig.apiKey && aiConfig.apiKey.trim().length > 5);

  if (hasKey) {
    try {
      const llmRes = await callLlmApi(displayUserText);
      aiChatHistory.pop();
      aiChatHistory.push({
        role: "assistant",
        content: llmRes.text,
        source: llmRes.source
      });
      renderAiChat();
      return;
    } catch (err) {
      console.error("Gemini API Error:", err);
      const fallback = generateSmartLocalResponse(isSurprise ? "KEJUTAN_MENU" : displayUserText);
      aiChatHistory.pop();
      aiChatHistory.push({
        role: "assistant",
        content: `**Kendala Koneksi API:**\n${err.message}\n\n*Menampilkan jawaban otomatis Chef Nusantara:*\n\n` + fallback.text,
        foods: fallback.foods,
        source: "Smart Engine Nusantara (Fallback)"
      });
      renderAiChat();
      return;
    }
  }

  // Simulate natural thinking delay for Smart Local Engine
  await new Promise(r => setTimeout(r, 380));
  const localRes = generateSmartLocalResponse(isSurprise ? "KEJUTAN_MENU" : displayUserText);
  aiChatHistory.pop();
  aiChatHistory.push({
    role: "assistant",
    content: localRes.text,
    foods: localRes.foods,
    source: "Smart Chef Nusantara"
  });
  renderAiChat();
}

function openAiModal(initialPrompt = "") {
  const m = $("#aiModal");
  if (!m) return;
  updateAiStatusBadge();
  renderCapPrompts();
  renderAiChat();
  if (!m.open) m.showModal();
  if (initialPrompt) {
    sendAiPrompt(initialPrompt);
  } else {
    setTimeout(() => {
      const inp = $("#aiInput");
      if (inp) inp.focus();
    }, 80);
  }
}

// Wire up Chef AI triggers and events
$("#btnRandom").addEventListener("click", () => {
  openAiModal();
});

const aiModal = $("#aiModal");
if (aiModal) {
  // Sync Settings Form Inputs
  const provSel = $("#aiProvider");
  const modelInp = $("#aiModel");
  const keyInp = $("#aiApiKey");
  const settingsPanel = $("#aiSettingsPanel");
  const settingsBtn = $("#btnAiSettingsToggle");

  if (provSel) provSel.value = aiConfig.provider;
  if (modelInp) modelInp.value = aiConfig.model;
  if (keyInp) keyInp.value = aiConfig.apiKey;

  if (provSel) {
    provSel.addEventListener("change", () => {
      const p = provSel.value;
      if (modelInp) modelInp.value = DEFAULT_MODELS[p] || "";
    });
  }

  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener("click", () => {
      const isHidden = settingsPanel.hidden;
      settingsPanel.hidden = !isHidden;
      settingsBtn.setAttribute("aria-expanded", String(isHidden));
      settingsBtn.classList.toggle("active", isHidden);
    });
  }

  const btnToggleKeyVis = $("#btnToggleKeyVis");
  if (btnToggleKeyVis && keyInp) {
    btnToggleKeyVis.addEventListener("click", () => {
      const isPwd = keyInp.type === "password";
      keyInp.type = isPwd ? "text" : "password";
      btnToggleKeyVis.textContent = isPwd ? "Sembunyikan" : "Lihat";
    });
  }

  const btnTestAiKey = $("#btnTestAiKey");
  if (btnTestAiKey) {
    btnTestAiKey.addEventListener("click", async () => {
      const prov = provSel ? provSel.value : "gemini";
      const key = keyInp ? keyInp.value.trim().replace(/^["']|["']$/g, "") : "";
      let mdl = modelInp ? modelInp.value.trim() : DEFAULT_MODELS[prov];
      if (prov === "gemini" && (mdl === "gemini-2.5-flash" || !mdl)) {
        mdl = "gemini-1.5-flash";
        if (modelInp) modelInp.value = mdl;
      }
      if (!key) {
        showToast("Masukkan API Key terlebih dahulu.");
        return;
      }

      btnTestAiKey.disabled = true;
      btnTestAiKey.textContent = "Menguji...";

      try {
        if (prov === "gemini") {
          let cleanM = mdl.replace(/^models\//, "");
          async function pingGemini(m) {
            const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`;
            return await fetch(testUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: "Tes koneksi, jawab singkat: siap" }] }]
              })
            });
          }

          let testRes = await pingGemini(cleanM);
          if (!testRes.ok) {
            const errD = await testRes.json().catch(() => ({}));
            const msg = errD?.error?.message || `HTTP ${testRes.status}`;
            const isOverloaded = testRes.status === 503 || testRes.status === 429 || /high demand|spikes in demand|unavailable/i.test(msg);
            if (isOverloaded && cleanM !== "gemini-1.5-flash") {
              const retryRes = await pingGemini("gemini-1.5-flash");
              if (retryRes.ok) {
                if (modelInp) modelInp.value = "gemini-1.5-flash";
                showToast(`Model ${cleanM} sedang penuh di Google, otomatis dialihkan ke gemini-1.5-flash (Berhasil!)`);
                return;
              }
            }
            throw new Error(msg);
          }
        } else {
          const testEndp = prov === "groq"
            ? "https://api.groq.com/openai/v1/chat/completions"
            : "https://api.openai.com/v1/chat/completions";
          const testRes = await fetch(testEndp, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
            body: JSON.stringify({
              model: mdl,
              messages: [{ role: "user", content: "Tes koneksi, jawab singkat: siap" }],
              max_tokens: 10
            })
          });
          if (!testRes.ok) {
            const errD = await testRes.json().catch(() => ({}));
            throw new Error(errD?.error?.message || `HTTP ${testRes.status}`);
          }
        }
        showToast(`Koneksi ${PROVIDER_NAMES[prov]} Berhasil!`);
      } catch (err) {
        showToast(`Gagal: ${err.message}`);
      } finally {
        btnTestAiKey.disabled = false;
        btnTestAiKey.textContent = "Tes Koneksi";
      }
    });
  }

  const btnSaveAiConfig = $("#btnSaveAiConfig");
  if (btnSaveAiConfig) {
    btnSaveAiConfig.addEventListener("click", () => {
      aiConfig.provider = provSel ? provSel.value : "gemini";
      let chosenModel = (modelInp && modelInp.value.trim()) ? modelInp.value.trim() : DEFAULT_MODELS[aiConfig.provider];
      if (aiConfig.provider === "gemini" && (chosenModel === "gemini-2.5-flash" || !chosenModel)) {
        chosenModel = "gemini-1.5-flash";
        if (modelInp) modelInp.value = chosenModel;
      }
      aiConfig.model = chosenModel;
      aiConfig.apiKey = keyInp ? keyInp.value.trim().replace(/^["']|["']$/g, "") : "";
      try {
        localStorage.setItem("nusantara_ai_cfg", JSON.stringify(aiConfig));
      } catch (e) {}
      updateAiStatusBadge();
      if (settingsPanel) settingsPanel.hidden = true;
      if (settingsBtn) settingsBtn.classList.remove("active");
      showToast(aiConfig.apiKey ? `API Key ${PROVIDER_NAMES[aiConfig.provider]} berhasil disimpan!` : "Konfigurasi disimpan (Mode Pintar)");
      renderAiChat();
    });
  }

  const btnClearAiKey = $("#btnClearAiKey");
  if (btnClearAiKey) {
    btnClearAiKey.addEventListener("click", () => {
      aiConfig.apiKey = "";
      if (keyInp) keyInp.value = "";
      try {
        localStorage.setItem("nusantara_ai_cfg", JSON.stringify(aiConfig));
      } catch (e) {}
      updateAiStatusBadge();
      showToast("API Key dihapus");
      renderAiChat();
    });
  }

  $("#btnAiClose").addEventListener("click", () => aiModal.close());
  aiModal.addEventListener("click", e => {
    if (e.target.id === "aiModal") aiModal.close();
  });

  $("#btnAiClear").addEventListener("click", () => {
    aiChatHistory = [];
    renderAiChat();
    showToast("Percakapan Chef AI dibersihkan");
  });

  $("#btnAiSurprise").addEventListener("click", () => {
    sendAiPrompt("KEJUTAN_MENU");
  });

  $$(".ai-cap-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      activeCapTab = tab.dataset.cap;
      $$(".ai-cap-tab").forEach(t => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
      });
      renderCapPrompts();
    });
  });

  $("#aiQuickPrompts").addEventListener("click", e => {
    const chip = e.target.closest(".ai-prompt-chip");
    if (!chip) return;
    const list = AI_CAPABILITY_PROMPTS[activeCapTab] || [];
    const item = list[+chip.dataset.idx];
    if (item) sendAiPrompt(item.prompt);
  });

  $("#aiChatList").addEventListener("click", e => {
    const openBtn = e.target.closest("[data-open-food]");
    if (openBtn) {
      const fid = +openBtn.dataset.openFood;
      aiModal.close();
      openFood(fid);
      return;
    }
    const tipsBtn = e.target.closest("[data-ask-tips]");
    if (tipsBtn) {
      const dishName = tipsBtn.dataset.askTips;
      sendAiPrompt(`Bagaimana tips rahasia memasak ${dishName} agar anti-gagal serta alternatif substitusi bahannya?`);
      return;
    }
    const cfgLink = e.target.closest("[data-open-settings]");
    if (cfgLink && settingsPanel && settingsBtn) {
      settingsPanel.hidden = false;
      settingsBtn.classList.add("active");
      if (keyInp) keyInp.focus();
    }
  });

  $("#aiChatForm").addEventListener("submit", e => {
    e.preventDefault();
    const inp = $("#aiInput");
    if (!inp || !inp.value.trim()) return;
    const text = inp.value.trim();
    inp.value = "";
    sendAiPrompt(text);
  });
}

updateThemeUI();
renderMap();
renderGrid();
