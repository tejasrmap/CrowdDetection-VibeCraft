/* CHART */
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "crowd123") {
    localStorage.setItem("adminAuth", "true");
    initDashboard();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
}

fetch("/api/admin/history")
  .then(res => res.json())
  .then(data => {
    console.log("Admin data:", data);

    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>Location ${row.location_id}</td>
        <td>${row.people_count}</td>
        <td>${row.crowd_level}</td>
        <td>${row.people_count > 15 ? "High" : "Normal"}</td>
      `;
      table.appendChild(tr);
    });
  })
  .catch(err => console.error(err));


function initDashboard() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}

/* AUTO LOGIN CHECK */
if (localStorage.getItem("adminAuth") === "true") {
  initDashboard();
}

const ctx = document.getElementById("chart");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25"],
    datasets: [{
      label: "People Count",
      data: [6, 10, 18, 22, 16, 12],
      borderColor: "#22c55e",
      backgroundColor: "rgba(34,197,94,0.15)",
      tension: 0.35,
      fill: true
    }]
  },
  options: {
    plugins: {
      legend: { labels: { color: "#e5e7eb" } }
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.1)" } }
    }
  }
});

/* DATA */
const locations = [
  { name: "Main Mess", people: 28, status: "High", pressure: "High" },
  { name: "Food Court", people: 32, status: "High", pressure: "High" },
  { name: "Library", people: 5, status: "Low", pressure: "Low" },
  { name: "Annapurna Mess", people: 25, status: "High", pressure: "High" },
  { name: "Vedavathi Mess", people: 16, status: "Medium", pressure: "Moderate" }
];

const tableBody = document.getElementById("tableBody");
const heatList = document.getElementById("heatList");
const highZonesEl = document.getElementById("highZones");

/* RENDER TABLE */
function renderTable() {
  tableBody.innerHTML = "";
  locations.forEach(loc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${loc.name}</td>
      <td>${loc.people}</td>
      <td class="status-${loc.status.toLowerCase()}">${loc.status}</td>
      <td>${loc.pressure}</td>
    `;
    tableBody.appendChild(row);
  });
}

/* RENDER HEAT */
function renderHeat() {
  heatList.innerHTML = "";
  let highCount = 0;

  locations.forEach(loc => {
    if (loc.status === "High") highCount++;
    const item = document.createElement("div");
    item.className = `heat-item ${loc.status.toLowerCase()}`;
    item.innerHTML = `<span>${loc.name}</span><span>${loc.status}</span>`;
    heatList.appendChild(item);
  });

  highZonesEl.innerText = highCount;
}

/* INITIAL RENDER */
renderTable();
renderHeat();

/* LIVE UPDATE SIMULATION */
setInterval(() => {
  locations.forEach(loc => {
    const delta = Math.floor(Math.random() * 5 - 2);
    loc.people = Math.max(0, loc.people + delta);
  });
  renderTable();
  renderHeat();
}, 4000);

function logout() {
  localStorage.removeItem("adminAuth");
  location.reload();
}


