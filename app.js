// --- Données de base -------------------------------------------------

const state = {
  totalXp: 0,
  tasksDone: 0,
  history: [],
  currentPortal: "daily",
  tasks: {
    daily: [
      { id: 1, label: "Vaisselle complète", xp: 150, done: false },
      { id: 2, label: "Ranger le salon", xp: 120, done: false },
      { id: 3, label: "Vider les poubelles", xp: 80, done: false }
    ],
    weekly: [
      { id: 4, label: "Aspirateur dans tout le logement", xp: 250, done: false },
      { id: 5, label: "Nettoyer la salle de bain", xp: 220, done: false }
    ],
    monthly: [
      { id: 6, label: "Laver les vitres principales", xp: 300, done: false },
      { id: 7, label: "Gros nettoyage de la cuisine", xp: 350, done: false }
    ],
    custom: [
      { id: 8, label: "Rangement dressing / placard", xp: 280, done: false }
    ]
  }
};

let nextTaskId = 9;

// --- Helpers ---------------------------------------------------------

function getLevelLabel(xp) {
  if (xp < 500) return "Novice du ménage";
  if (xp < 1500) return "Apprenti de la propreté";
  if (xp < 3000) return "Gardien du foyer";
  if (xp < 6000) return "Maître du rangement";
  return "Légende du ménage";
}

// --- Rendu des tâches ------------------------------------------------

function renderTasks() {
  const container = document.getElementById("tasks-container");
  const portalKey = state.currentPortal;
  const tasks = state.tasks[portalKey];

  container.innerHTML = "";

  if (!tasks || tasks.length === 0) {
    container.innerHTML = `<p class="info">Aucune tâche pour cette catégorie pour l’instant.</p>`;
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";

    const main = document.createElement("div");
    main.className = "task-main";

    const label = document.createElement("div");
    label.className = "task-label";
    label.textContent = task.label;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const freqLabel =
      portalKey === "daily"
        ? "Quotidienne"
        : portalKey === "weekly"
        ? "Hebdomadaire"
        : portalKey === "monthly"
        ? "Mensuelle"
        : "Personnalisée";

    meta.innerHTML = `<span>${freqLabel}</span>`;

    main.appendChild(label);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const xp = document.createElement("div");
    xp.className = "task-xp";
    xp.textContent = `+${task.xp} XP`;

    const btn = document.createElement("button");
    btn.className = "task-btn";
    btn.textContent = task.done ? "Terminé" : "Compléter";
    if (task.done) {
      btn.classList.add("done");
    }

    btn.addEventListener("click", () => completeTask(portalKey, task.id));

    actions.appendChild(xp);
    actions.appendChild(btn);

    card.appendChild(main);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

// --- Compléter une tâche ---------------------------------------------

function completeTask(portalKey, taskId) {
  const tasks = state.tasks[portalKey];
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  // Tu peux autoriser de rejouer la mission, donc on ne bloque pas si done déjà
  state.totalXp += task.xp;
  state.tasksDone += 1;
  task.done = true;

  const entry = {
    label: task.label,
    xp: task.xp,
    at: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
  state.history.unshift(entry);
  if (state.history.length > 10) state.history.pop();

  renderTasks();
  renderStatus();
}

// --- Statut & historique ---------------------------------------------

function renderStatus() {
  const xpEl = document.getElementById("total-xp");
  const levelEl = document.getElementById("level-label");
  const doneEl = document.getElementById("tasks-done-count");
  const historyList = document.getElementById("history-list");

  xpEl.textContent = `${state.totalXp} XP`;
  levelEl.textContent = getLevelLabel(state.totalXp);
  doneEl.textContent = `${state.tasksDone} missions`;

  historyList.innerHTML = "";
  if (state.history.length === 0) {
    historyList.innerHTML = `<li>Aucune mission terminée pour l’instant.</li>`;
    return;
  }

  state.history.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `[${entry.at}] ${entry.label} (+${entry.xp} XP)`;
    historyList.appendChild(li);
  });
}

// --- Navigation onglets ----------------------------------------------

function setupTabs() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const tabs = document.querySelectorAll(".tab");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");

      navButtons.forEach((b) => b.classList.remove("active"));
      tabs.forEach((t) => t.classList.remove("active"));

      btn.classList.add("active");
      const section = document.getElementById(`tab-${target}`);
      if (section) section.classList.add("active");
    });
  });
}

// --- Navigation portails ---------------------------------------------

function setupPortals() {
  const portalButtons = document.querySelectorAll(".portal-btn");

  portalButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const portal = btn.getAttribute("data-portal");
      state.currentPortal = portal;

      portalButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      renderTasks();
    });
  });
}

// --- Ajout de tâche --------------------------------------------------

function setupAddTask() {
  const labelInput = document.getElementById("new-task-label");
  const xpInput = document.getElementById("new-task-xp");
  const portalSelect = document.getElementById("new-task-portal");
  const addBtn = document.getElementById("add-task-btn");

  addBtn.addEventListener("click", () => {
    const label = labelInput.value.trim();
    const xp = parseInt(xpInput.value, 10) || 0;
    const portal = portalSelect.value;

    if (!label || xp <= 0) {
      alert("Merci d’indiquer un nom de tâche et un XP positif.");
      return;
    }

    const newTask = {
      id: nextTaskId++,
      label,
      xp,
      done: false
    };

    state.tasks[portal].push(newTask);

    if (state.currentPortal === portal) {
      renderTasks();
    }

    labelInput.value = "";
    xpInput.value = 100;
  });
}

// --- PWA : enregistrement du service worker --------------------------

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => {
        console.warn("Service worker non enregistré :", err);
      });
  }
}

// --- Init ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupPortals();
  setupAddTask();
  renderTasks();
  renderStatus();
  registerServiceWorker();
});
