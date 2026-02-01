let chart;

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

function initDashboard() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  loadAdminData();
}

function logout() {
  localStorage.removeItem("adminAuth");
  location.reload();
}

if (localStorage.getItem("adminAuth") === "true") {
  initDashboard();
}

function loadAdminData() {
  fetch("/api/admin/history")
    .then(res => res.json())
    .then(data => {
      renderTable(data);
      renderChart(data);
    });
}

function renderTable(data) {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  let highZones = 0;

  data.forEach(row => {
    if (row.crowd_level === "High") highZones++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.location_name || "Location"}</td>
      <td>${row.people_count}</td>
      <td class="status-${row.crowd_level.toLowerCase()}">${row.crowd_level}</td>
      <td>${row.people_count > 15 ? "High" : "Normal"}</td>
    `;
    table.appendChild(tr);
  });

  document.getElementById("highZones").innerText = highZones;
}

function renderChart(data) {
  const ctx = document.getElementById("chart").getContext("2d");

  const labels = data.map((_, i) => `#${i + 1}`).reverse();
  const values = data.map(d => d.people_count).reverse();

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "People Count",
        data: values,
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
        x: { ticks: { color: "#94a3b8" } },
        y: { ticks: { color: "#94a3b8" } }
      }
    }
  });
}
