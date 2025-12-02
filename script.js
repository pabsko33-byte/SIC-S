// script.js
// Tout est découpé par "page". Le code ne s’exécute que si les éléments existent.

// ===== SIMULATION D'INVESTISSEMENT =====

function setupSimulation() {
  const form = document.querySelector("#sim-form");
  const ctx = document.getElementById("simChart");
  if (!form || !ctx) return;

  let chart = null;

  function compound(capital, versement, years, rate) {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    let totalInvested = capital;
    let value = capital;
    const points = [];

    for (let m = 0; m <= months; m++) {
      if (m > 0) {
        value = value * (1 + monthlyRate) + versement;
        totalInvested += versement;
      }
      points.push({ t: m / 12, v: value });
    }

    return { totalInvested, value, points };
  }

  function updateResults(res, selectorPrefix) {
    document.querySelector(`${selectorPrefix}-invested`).textContent =
      res.totalInvested.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
    document.querySelector(`${selectorPrefix}-value`).textContent =
      res.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
    document.querySelector(`${selectorPrefix}-perf`).textContent =
      (res.value - res.totalInvested).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const capital = Number(document.querySelector("#capital").value || 0);
    const monthly = Number(document.querySelector("#monthly").value || 0);
    const years = Number(document.querySelector("#years").value || 0);
    const medianRate = Number(document.querySelector("#rate").value || 0);

    if (!capital || !years) return;

    const pessRate = medianRate - 2;
    const optRate = medianRate + 2;

    const median = compound(capital, monthly, years, medianRate);
    const pess = compound(capital, monthly, years, pessRate);
    const opt = compound(capital, monthly, years, optRate);

    updateResults(pess, "#pess");
    updateResults(median, "#med");
    updateResults(opt, "#opt");

    const labels = median.points.map((p) => p.t.toFixed(1));
    const dataMedian = median.points.map((p) => p.v);
    const dataPess = pess.points.map((p) => p.v);
    const dataOpt = opt.points.map((p) => p.v);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Scénario pessimiste",
            data: dataPess,
            borderColor: "#f97373",
            borderWidth: 1.2,
            tension: 0.25,
            pointRadius: 0,
          },
          {
            label: "Scénario médian",
            data: dataMedian,
            borderColor: "#4ade80",
            borderWidth: 2,
            tension: 0.25,
            pointRadius: 0,
          },
          {
            label: "Scénario optimiste",
            data: dataOpt,
            borderColor: "#38bdf8",
            borderWidth: 1.4,
            tension: 0.25,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#e5e7eb", font: { size: 11 } },
          },
        },
        scales: {
          x: {
            ticks: { color: "#9ca3af", maxTicksLimit: 8 },
            grid: { color: "rgba(55,65,81,0.6)" },
          },
          y: {
            ticks: {
              color: "#9ca3af",
              callback: (v) =>
                v.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €",
            },
            grid: { color: "rgba(55,65,81,0.6)" },
          },
        },
      },
    });
  });
}

// ===== MARKETS MOCK + INTERACTION =====

function setupMarkets() {
  const tableBody = document.querySelector("#assets-body");
  const ctx = document.getElementById("marketChart");
  if (!tableBody || !ctx) return;

  const assets = [
    {
      id: "CAC40",
      name: "CAC 40",
      type: "Actions / ETF",
      price: 7420,
      change: 0.32,
      series: [6800, 6950, 7050, 7200, 7350, 7420],
    },
    {
      id: "SP500",
      name: "S&P 500",
      type: "Actions / ETF",
      price: 5098,
      change: -0.27,
      series: [5000, 5040, 5065, 5100, 5120, 5098],
    },
    {
      id: "NASDAQ",
      name: "NASDAQ 100",
      type: "Actions / Tech",
      price: 18045,
      change: 0.61,
      series: [17000, 17300, 17650, 17900, 18100, 18045],
    },
    {
      id: "MSCIW",
      name: "MSCI World",
      type: "ETF Monde",
      price: 3220,
      change: 0.18,
      series: [3000, 3060, 3100, 3160, 3205, 3220],
    },
    {
      id: "BTC",
      name: "Bitcoin",
      type: "Crypto labo",
      price: 68440,
      change: 1.25,
      series: [62000, 63500, 65000, 67000, 68000, 68440],
    },
    {
      id: "ETH",
      name: "Ethereum",
      type: "Crypto labo",
      price: 3905,
      change: -0.8,
      series: [3800, 3880, 3920, 3970, 3950, 3905],
    },
  ];

  let chart = null;

  function renderTable() {
    tableBody.innerHTML = "";
    assets.forEach((asset) => {
      const tr = document.createElement("tr");
      tr.dataset.id = asset.id;
      tr.innerHTML = `
        <td><span class="asset-name">${asset.name}</span><br><span class="text-muted">${asset.type}</span></td>
        <td>${asset.price.toLocaleString("fr-FR")} €</td>
        <td class="${asset.change >= 0 ? "change-pos" : "change-neg"}">
          ${asset.change >= 0 ? "+" : ""}${asset.change.toFixed(2)} %
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function showAsset(asset) {
    document.querySelector("#asset-name").textContent = asset.name;
    document.querySelector("#asset-type").textContent = asset.type;
    document.querySelector("#asset-price").textContent =
      asset.price.toLocaleString("fr-FR") + " €";
    document.querySelector("#asset-change").textContent =
      (asset.change >= 0 ? "+" : "") + asset.change.toFixed(2) + " %";
    document
      .querySelector("#asset-change")
      .classList.toggle("change-pos", asset.change >= 0);
    document
      .querySelector("#asset-change")
      .classList.toggle("change-neg", asset.change < 0);

    const labels = ["T-5", "T-4", "T-3", "T-2", "T-1", "Maintenant"];

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: asset.name,
            data: asset.series,
            borderColor: "#38bdf8",
            borderWidth: 2,
            tension: 0.25,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(55,65,81,0.6)" },
          },
          y: {
            ticks: {
              color: "#9ca3af",
              callback: (v) => v.toLocaleString("fr-FR"),
            },
            grid: { color: "rgba(55,65,81,0.6)" },
          },
        },
      },
    });
  }

  renderTable();
  showAsset(assets[0]);

  tableBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const asset = assets.find((a) => a.id === tr.dataset.id);
    if (asset) showAsset(asset);
  });

  // NOTE: plus tard, tu remplaces ces données mockées par un fetch vers une API marchés.
}

// ===== CHATBOT PEDAGO =====

function setupChatbot() {
  const form = document.querySelector("#chat-form");
  const input = document.querySelector("#chat-input");
  const log = document.querySelector("#chat-log");
  const faqContainer = document.querySelector("#faq-tags");
  if (!form || !input || !log || !faqContainer) return;

  const faq = {
    "Livret vs ETF long terme": `Un livret rémunère faiblement mais reste liquide et sans risque de capital (hors inflation). Un ETF actions est exposé aux marchés : plus volatil, mais historiquement mieux rémunéré sur un horizon de 8–15 ans. La question clé n'est pas "quel produit est meilleur", mais "pour quel horizon, quel besoin et quel niveau de risque".`,
    "Comment aborder le risque": `On distingue le risque de marché (variations), le risque de liquidité (pouvoir vendre facilement) et le risque de contrepartie. Pour un étudiant, le risque principal est souvent de s'exposer à un produit qu’il ne comprend pas, avec un horizon trop court.`,
    "Place de la crypto": `Dans une approche pédagogique, la crypto est traitée comme un labo de volatilité, pas comme un raccourci vers la richesse. Une poche limitée, jamais au cœur du patrimoine, et jamais sur de l'argent dont on a besoin à court terme.`,
    "Horizon de placement": `Plus l'horizon est long, plus il est probable que la volatilité de court terme s'efface. En dessous de 3–5 ans, il est délicat de s'exposer fortement aux actions. Au-delà de 8–10 ans, un portefeuille diversifié peut absorber davantage de variations.`,
    "ETF monde, définition": `Un ETF Monde est un fonds indiciel coté qui réplique un indice d'actions internationales. C'est un outil simple pour s'exposer à plusieurs centaines d'entreprises en une seule ligne, sans devoir sélectionner des titres individuellement.`,
  };

  function appendMessage(text, from) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${from === "user" ? "user" : "bot"}`;
    bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }

  function answer(question) {
    const key = Object.keys(faq).find((k) =>
      question.toLowerCase().includes(k.split(" ")[0].toLowerCase())
    );
    if (key) {
      appendMessage(faq[key], "bot");
    } else {
      appendMessage(
        "Je te donne une grille simple : horizon, besoin de liquidité, tolérance au risque. Pour un cas précis, ce composant pourra plus tard être relié à une API d’IA afin de générer une réponse adaptée.",
        "bot"
      );
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    appendMessage(q, "user");
    input.value = "";
    setTimeout(() => answer(q), 400);
  });

  // Tags FAQ
  Object.keys(faq).forEach((label) => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "tag";
    tag.textContent = label;
    tag.addEventListener("click", () => {
      appendMessage(label, "user");
      setTimeout(() => appendMessage(faq[label], "bot"), 300);
    });
    faqContainer.appendChild(tag);
  });

  // NOTE: plus tard, tu remplaces answer() par un appel fetch vers ton API IA.
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
  setupSimulation();
  setupMarkets();
  setupChatbot();
});
