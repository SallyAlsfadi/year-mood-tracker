const moods = [
  { key: "Normal", color: "#8ecae6" },
  { key: "Happy", color: "#90be6d" },
  { key: "Success", color: "#ffd166" },
  { key: "Sad", color: "#4361ee" },
  { key: "Sick", color: "#52b788" },
  { key: "Angry", color: "#e63946" },
  { key: "Stress", color: "#b5179e" },
  { key: "Lazy", color: "#f4a261" },
];

let selectedMood = moods[0].key;

function renderPalette() {
  const palette = document.getElementById("palette");
  palette.innerHTML = "";

  moods.forEach((mood) => {
    const btn = document.createElement("div");
    btn.className = "mood-btn" + (mood.key === selectedMood ? " selected" : "");

    btn.innerHTML = `
        <span class="swatch" style="background:${mood.color}"></span>
        <span>${mood.key}</span>
      `;

    btn.addEventListener("click", () => {
      selectedMood = mood.key;
      renderPalette();
      console.log("Selected mood:", selectedMood);
    });

    palette.appendChild(btn);
  });
}

renderPalette();

// --- January grid
const year = new Date().getFullYear();
const weekStart = 1; // 1=Monday, 0=Sunday

function weekdayLabels(start) {
  return start === 1
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["S", "M", "T", "W", "T", "F", "S"];
}

function firstWeekdayOffset(y, m, start) {
  const dow = new Date(y, m, 1).getDay(); // 0=Sun..6=Sat
  return (dow - start + 7) % 7;
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function moodColor(key) {
  return moods.find((m) => m.key === key)?.color ?? null;
}

const dayMoods = {};

function renderJanuary() {
  const monthsEl = document.getElementById("months");
  monthsEl.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "month";
  wrap.innerHTML = `<h2>January ${year}</h2>`;

  const grid = document.createElement("div");
  grid.className = "grid";

  // headers
  weekdayLabels(weekStart).forEach((w) => {
    const h = document.createElement("div");
    h.className = "head";
    h.textContent = w;
    grid.appendChild(h);
  });

  const monthIndex = 0; // January
  const offset = firstWeekdayOffset(year, monthIndex, weekStart);
  const total = daysInMonth(year, monthIndex);

  // blanks
  for (let i = 0; i < offset; i++) {
    const blank = document.createElement("div");
    blank.style.visibility = "hidden";
    grid.appendChild(blank);
  }

  // days
  for (let d = 1; d <= total; d++) {
    const id = `${year}-01-${String(d).padStart(2, "0")}`;

    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = d;

    const mood = dayMoods[id];
    if (mood) {
      cell.style.background = moodColor(mood);
    }

    cell.addEventListener("click", () => {
      dayMoods[id] = selectedMood;
      renderJanuary();
    });

    grid.appendChild(cell);
  }

  wrap.appendChild(grid);
  monthsEl.appendChild(wrap);
}

renderJanuary();
