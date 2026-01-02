const moods = [
  { key: "Normal", color: "#8ecae6", icon: "🙂" },
  { key: "Happy", color: "#90be6d", icon: "😊" },
  { key: "Success", color: "#ffd166", icon: "⚡" },
  { key: "Sad", color: "#4361ee", icon: "😔" },
  { key: "Sick", color: "#52b788", icon: "🤒" },
  { key: "Angry", color: "#e63946", icon: "😡" },
  { key: "Stress", color: "#b5179e", icon: "😣" },
  { key: "Lazy", color: "#f4a261", icon: "😴" },
];

let selectedMood = moods[0].key;
let selectedDayId = null;

const year = new Date().getFullYear();

function moodColor(key) {
  return moods.find((m) => m.key === key)?.color ?? null;
}

function moodIcon(key) {
  return moods.find((m) => m.key === key)?.icon ?? "";
}

function storageKey(y) {
  return `year-mood-tracker-${y}`;
}

function loadDayMoods(y) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(y)) || "{}");
  } catch {
    return {};
  }
}

function saveDayMoods(y, data) {
  localStorage.setItem(storageKey(y), JSON.stringify(data));
}

const dayMoods = loadDayMoods(year);

function daysInMonth(y, monthIndex) {
  return new Date(y, monthIndex + 1, 0).getDate();
}

function monthLabel(monthIndex) {
  const labels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  return labels[monthIndex];
}

function renderPalette() {
  const palette = document.getElementById("palette");
  palette.innerHTML = "";

  moods.forEach((mood) => {
    const btn = document.createElement("div");
    btn.className = "mood-btn" + (mood.key === selectedMood ? " selected" : "");

    btn.innerHTML = `
        <span class="swatch" style="background:${mood.color}"></span>
        <span>${mood.icon} ${mood.key}</span>
      `;

    btn.addEventListener("click", () => {
      selectedMood = mood.key;
      renderPalette();
    });

    palette.appendChild(btn);
  });
}

function renderYearLabel() {
  const el = document.getElementById("year-label");
  el.textContent = `${year}`;
}

function renderPixels() {
  const container = document.getElementById("pixels");
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "pixels-grid";

  const style = document.createElement("style");
  style.textContent = `
      .pixels-grid{
        display:grid;
        grid-template-columns: 30px repeat(12, 14px);
        gap: 4px;
        align-items:center;
        justify-content:start;
        padding: 10px;
      }
      .px-head{
        font-size: 11px;
        color: #6b6b6b;
        text-align:center;
      }
      .px-rowlabel{
        font-size: 11px;
        color: #6b6b6b;
        text-align:right;
        padding-right: 6px;
      }
      .px{
        width: 14px;
        height: 14px;
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.10);
        background: #fff;
        cursor: pointer;
      }
      .px.off{
        visibility:hidden;
      }
      .px.selected{
        outline: 3px solid rgba(0,0,0,0.14);
      }
    `;
  document.head.appendChild(style);

  const corner = document.createElement("div");
  corner.className = "px-head";
  corner.textContent = "";
  grid.appendChild(corner);

  for (let m = 0; m < 12; m++) {
    const h = document.createElement("div");
    h.className = "px-head";
    h.textContent = monthLabel(m);
    grid.appendChild(h);
  }

  for (let day = 1; day <= 31; day++) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "px-rowlabel";
    rowLabel.textContent = String(day);
    grid.appendChild(rowLabel);

    for (let m = 0; m < 12; m++) {
      const maxDay = daysInMonth(year, m);
      const id = `${year}-${String(m + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const cell = document.createElement("div");
      cell.className = "px";

      if (day > maxDay) {
        cell.classList.add("off");
        grid.appendChild(cell);
        continue;
      }

      const mood = dayMoods[id];
      if (mood) cell.style.background = moodColor(mood);

      if (id === selectedDayId) cell.classList.add("selected");

      cell.title = `${id}${mood ? ` — ${mood}` : ""}`;

      cell.addEventListener("click", () => {
        selectedDayId = id;
        dayMoods[id] = selectedMood;
        saveDayMoods(year, dayMoods);
        renderPixels();
        renderStats();
      });

      grid.appendChild(cell);
    }
  }

  container.appendChild(grid);
}

function renderStats() {
  const totalEl = document.getElementById("stat-total");
  const topEl = document.getElementById("stat-top-mood");
  const bestEl = document.getElementById("stat-best-month");

  const entries = Object.values(dayMoods);
  totalEl.textContent = String(entries.length);

  const counts = {};
  for (const m of entries) counts[m] = (counts[m] || 0) + 1;

  let topMood = null;
  let topCount = -1;
  for (const [m, c] of Object.entries(counts)) {
    if (c > topCount) {
      topCount = c;
      topMood = m;
    }
  }
  topEl.textContent = topMood ? `${moodIcon(topMood)} ${topMood}` : "—";

  const score = new Array(12).fill(0);
  for (const [id, mood] of Object.entries(dayMoods)) {
    const monthIndex = parseInt(id.slice(5, 7), 10) - 1;
    if (mood === "Happy" || mood === "Success") score[monthIndex] += 1;
  }
  let bestIdx = -1;
  let bestScore = -1;
  for (let i = 0; i < 12; i++) {
    if (score[i] > bestScore) {
      bestScore = score[i];
      bestIdx = i;
    }
  }
  if (bestScore <= 0) {
    bestEl.textContent = "—";
  } else {
    const name = new Date(year, bestIdx, 1).toLocaleString(undefined, {
      month: "long",
    });
    bestEl.textContent = `${name}`;
  }
}

document.getElementById("clear-day").addEventListener("click", () => {
  if (!selectedDayId) return;

  delete dayMoods[selectedDayId];
  saveDayMoods(year, dayMoods);
  renderPixels();
  renderStats();
});

renderPalette();
renderYearLabel();
renderPixels();
renderStats();
