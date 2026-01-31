const LOCATIONS = [
  "Main Mess","Library","Food Court","Gate 1","Gate 2",
  "Gate 3 - Food Parcels","Gate 3 - Courier Parcels",
  "Annapurna Mess","Annapurna Mess - Lawn Area",
  "Vedavathi Mess","Ganga A Mess","Ganga B Mess",
  "V Block - 5th Floor Cafeteria",
  "Homi J Baba Block - 3rd Floor Cafeteria",
  "SR Block - Lift Side (T Cafe)",
  "SR Block - Grand Stairs Side",
  "CV Raman Block","Flag Area"
];

const FAKE = {};
LOCATIONS.forEach(l => {
  FAKE[l] = {
    people: Math.floor(Math.random()*30),
    crowd: ["Low","Medium","High"][Math.floor(Math.random()*3)],
    pressure: "Moderate"
  };
});

let currentLocation = "Main Mess";

const peopleEl = document.getElementById("people");
const crowdEl = document.getElementById("crowd");
const pressureEl = document.getElementById("pressure");
const decisionEl = document.getElementById("decision");
const titleEl = document.getElementById("pageTitle");
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.querySelector(".dropdown-menu");
const grid = document.getElementById("locationGrid");

LOCATIONS.forEach(loc => {
  const d = document.createElement("div");
  d.className = "loc-card";
  d.textContent = loc;
  d.onclick = () => switchLocation(loc);
  grid.appendChild(d);

  const m = document.createElement("div");
  m.textContent = loc;
  m.onclick = () => switchLocation(loc);
  dropdownMenu.appendChild(m);
});

function switchLocation(loc){
  currentLocation = loc;
  titleEl.innerText = loc;
  dropdownBtn.innerText = loc + " ▾";
  update();
}

function applyData(p,c){
  peopleEl.innerText = p;
  crowdEl.innerText = c;
  pressureEl.innerText = c;
  decisionEl.innerText =
    c==="Low"?"You can go now":
    c==="Medium"?"Proceed with caution":"Avoid now";
}

function update(){
  fetch(`/api/student/live?location=${encodeURIComponent(currentLocation)}`)
    .then(r=>r.json())
    .then(d=>{
      if(!d.people_count){
        const f=FAKE[currentLocation];
        applyData(f.people,f.crowd);
      } else {
        applyData(d.people_count,d.crowd_level);
      }
    })
    .catch(()=>{
      const f=FAKE[currentLocation];
      applyData(f.people,f.crowd);
    });
}

dropdownBtn.onclick=()=>dropdownMenu.classList.toggle("show");

document.querySelectorAll(".nav-item").forEach(i=>{
  i.onclick=()=>{
    document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
    i.classList.add("active");
    document.getElementById(i.dataset.view).classList.add("active-view");
  };
});

update();
setInterval(update,3000);

function generatePatterns(crowdLevel) {

  const PATTERNS = {

    Low: {
      trend: "Crowd levels have been consistently low with no sudden spikes detected.",
      peak: "This is an off-peak period with minimal congestion.",
      stability: "Crowd movement is stable and predictable.",
      confidence: "High confidence — conditions are ideal.",
      advice: "Best time to visit. You can proceed without hesitation."
    },

    Medium: {
      trend: "Gradual crowd build-up observed over recent intervals.",
      peak: "Approaching peak period, but still manageable.",
      stability: "Moderate fluctuations in crowd size.",
      confidence: "Moderate confidence — short waiting time expected.",
      advice: "You can go now, but avoid unnecessary delays."
    },

    High: {
      trend: "Rapid increase in crowd density detected recently.",
      peak: "Currently within peak hours.",
      stability: "Crowd is unstable with frequent inflow.",
      confidence: "Low confidence — conditions are crowded.",
      advice: "Not recommended right now. Consider visiting later."
    }

  };

  const p = PATTERNS[crowdLevel];

  document.getElementById("pattern-trend").innerText =
  `${p.trend} (${timeCtx} pattern)`;
  document.getElementById("pattern-peak").innerText = p.peak;
  document.getElementById("pattern-stability").innerText = p.stability;
  document.getElementById("pattern-confidence").innerText = p.confidence;
  document.getElementById("pattern-advice").innerText = p.advice;
}

function updateUI(data, source = "FAKE") {
  if (!data) return;

  // ===== METRICS =====
  const peopleEl = document.getElementById("people");
  const crowdEl = document.getElementById("crowd");
  const pressureEl = document.getElementById("pressure");
  const decisionEl = document.getElementById("decision");

  const people = data.people_count ?? data.people;
  const crowdLevel = data.crowd_level ?? data.crowd;

  animateNumber(peopleEl, people);
  crowdEl.innerText = crowdLevel;
  pressureEl.innerText = crowdLevel;

  crowdEl.className = `panel-value status ${crowdLevel.toLowerCase()}`;

  decisionEl.innerText =
    crowdLevel === "Low"
      ? "Recommended to visit"
      : crowdLevel === "Medium"
      ? "Proceed with caution"
      : "Avoid at this time";

  // ===== PATTERNS =====
  updatePatternsByCrowd(crowdLevel);

  // ===== OPTIONAL DEBUG (SAFE) =====
  console.log(`[UI UPDATED] Source: ${source}, Crowd: ${crowdLevel}`);
  drawTrend(crowdLevel);

}

function updatePatternsByCrowd(crowdLevel) {
  const meter = document.getElementById("confidence-fill");

  const timeCtx = getTimeContext();

if (crowdLevel === "Low") {
  meter.style.width = "90%";
  meter.style.background = "#22c55e";
}
else if (crowdLevel === "Medium") {
  meter.style.width = "55%";
  meter.style.background = "#f59e0b";
}
else {
  meter.style.width = "25%";
  meter.style.background = "#ef4444";
}

  const PATTERNS = {
    Low: {
      trend: "Crowd levels have remained consistently low.",
      peak: "This is an off-peak period with minimal congestion.",
      stability: "Crowd movement is stable and predictable.",
      confidence: "High confidence — ideal conditions.",
      advice: "Best time to visit. You can proceed freely."
    },
    Medium: {
      trend: "A gradual crowd build-up was observed recently.",
      peak: "Approaching peak hours, but still manageable.",
      stability: "Moderate fluctuations in crowd size.",
      confidence: "Moderate confidence — short waiting expected.",
      advice: "You may go now, but avoid delays."
    },
    High: {
      trend: "Rapid increase in crowd density detected.",
      peak: "Currently within peak hours.",
      stability: "Crowd is unstable with heavy inflow.",
      confidence: "Low confidence — crowded conditions.",
      advice: "Not recommended now. Consider visiting later."
    }
    
  };

  const p = PATTERNS[crowdLevel];
  if (!p) return;

  document.getElementById("pattern-trend").innerText =
  `${p.trend} (${timeCtx} pattern)`;
  document.getElementById("pattern-peak").innerText = p.peak;
  document.getElementById("pattern-stability").innerText = p.stability;
  document.getElementById("pattern-confidence").innerText = p.confidence;
  document.getElementById("pattern-advice").innerText = p.advice;
}

function getTimeContext() {
  const h = new Date().getHours();

  if (h >= 8 && h < 11) return "Morning";
  if (h >= 11 && h < 15) return "Lunch";
  if (h >= 15 && h < 18) return "Evening";
  return "Off-hours";
}

function drawTrend(crowdLevel) {
  const c = document.getElementById("trendCanvas");
  if (!c) return;

  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const base =
    crowdLevel === "Low" ? 20 :
    crowdLevel === "Medium" ? 50 : 80;

  ctx.beginPath();
  ctx.strokeStyle =
    crowdLevel === "Low" ? "#22c55e" :
    crowdLevel === "Medium" ? "#f59e0b" : "#ef4444";

  for (let i = 0; i < 10; i++) {
    const y = base + Math.random() * 10;
    ctx.lineTo(i * 30, 120 - y);
  }
  ctx.stroke();
}

function animateNumber(el, to) {
  const from = Number(el.innerText) || 0;
  const step = (to - from) / 20;
  let cur = from;

  const interval = setInterval(() => {
    cur += step;
    el.innerText = Math.round(cur);

    if (
      (step > 0 && cur >= to) ||
      (step < 0 && cur <= to)
    ) {
      el.innerText = to;
      clearInterval(interval);
    }
  }, 20);
}
