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
