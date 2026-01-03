const moods = [
  { key: "low-energy", color: "#7b38c7" },
  { key: "productive", color: "#ff4fa3" },
  { key: "neutral", color: "#7f8c8d" },
  { key: "motivated", color: "#f1d44a" },
  { key: "stressed", color: "#1da1f2" },
  { key: "overloaded", color: "#3ddc97" },
  { key: "sick", color: "#f4a261" },
  { key: "blocked", color: "#e63946" },
];

const year = new Date().getFullYear();
const pad2 = (n) => String(n).padStart(2, "0");
const storageKey = (y) => `year-mood-tracker-${y}`;

const loadJSON = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

let selectedMood = moods[0].key;
let selectedDayId = null;
let dayMoods = loadJSON(storageKey(year), {});

const moodMap = Object.fromEntries(moods.map((m) => [m.key, m.color]));
const monthShort = Array.from({ length: 12 }, (_, i) =>
  new Date(year, i, 1)
    .toLocaleString(undefined, { month: "short" })
    .toUpperCase()
);

function fitPixelSize() {
  const panel = document.querySelector(".grid-panel");
  if (!panel) return;

  const style = getComputedStyle(document.documentElement);
  const label = parseInt(style.getPropertyValue("--px-label"), 10) || 64;
  const gap = parseInt(style.getPropertyValue("--px-gap"), 10) || 6;

  const panelPadding = 32;
  const available = panel.clientWidth - panelPadding - label - gap * 31;

  const px = Math.floor(available / 31);
  const clamped = Math.max(16, Math.min(px, 28));

  document.documentElement.style.setProperty("--px-size", `${clamped}px`);
}

function renderPalette() {
  const palette = document.getElementById("palette");
  if (!palette) return;

  palette.innerHTML = "";

  for (const mood of moods) {
    const btn = document.createElement("div");
    btn.className = `mood-btn${mood.key === selectedMood ? " selected" : ""}`;
    btn.innerHTML = `<span class="swatch" style="background:${mood.color}"></span><span>${mood.key}</span>`;
    btn.addEventListener("click", () => {
      selectedMood = mood.key;
      renderPalette();
    });
    palette.appendChild(btn);
  }
}

function renderYearLabel() {
  const el = document.getElementById("year-label");
  if (el) el.textContent = String(year);
}

function renderPixels() {
  const container = document.getElementById("pixels");
  if (!container) return;

  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "pixels-grid";

  const corner = document.createElement("div");
  corner.className = "px-head";
  grid.appendChild(corner);

  for (let d = 1; d <= 31; d++) {
    const h = document.createElement("div");
    h.className = "px-head";
    h.textContent = String(d);
    grid.appendChild(h);
  }

  for (let m = 0; m < 12; m++) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "px-rowlabel";
    rowLabel.textContent = monthShort[m];
    grid.appendChild(rowLabel);

    const maxDay = daysInMonth(year, m);

    for (let d = 1; d <= 31; d++) {
      const cell = document.createElement("div");
      cell.className = "px";

      if (d > maxDay) {
        cell.classList.add("off");
        grid.appendChild(cell);
        continue;
      }

      const id = `${year}-${pad2(m + 1)}-${pad2(d)}`;
      const mood = dayMoods[id];

      if (mood) {
        cell.style.background = moodMap[mood] || "";
        cell.classList.add("filled");
      }

      if (id === selectedDayId) cell.classList.add("selected");
      cell.title = mood ? `${id} — ${mood}` : id;

      cell.addEventListener("click", () => {
        selectedDayId = id;
        dayMoods[id] = selectedMood;
        saveJSON(storageKey(year), dayMoods);
        renderPixels();
      });

      grid.appendChild(cell);
    }
  }

  container.appendChild(grid);
}

function init() {
  renderYearLabel();
  renderPalette();
  fitPixelSize();
  renderPixels();

  window.addEventListener("resize", () => {
    fitPixelSize();
    renderPixels();
  });

  const clearBtn = document.getElementById("clear-day");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!selectedDayId) return;
      delete dayMoods[selectedDayId];
      saveJSON(storageKey(year), dayMoods);
      renderPixels();
    });
  }
}

init();
