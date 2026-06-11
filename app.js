// SECPROJ // HTB-HSLU Mapping Console
// Application Logic

// State Management
let currentFilter = "ALL";
let selectedItemId = null;
let scanlinesActive = true;
let soundActive = true;

// Web Audio API context for retro synth sound effects
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBeep(type) {
  if (!soundActive) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.setValueAtTime(1500, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'open') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'close') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
}


// Render filter buttons dynamically based on modules in dataset
function buildFilters() {
  const filterContainer = document.getElementById("filter-container");
  
  // Extract unique module codes
  const modules = Array.from(new Set(HTB_DATA.map(item => item.modulCode))).sort();
  
  // Build HTML
  let buttonsHTML = `<button class="tag-btn active" data-filter="ALL">ALL MODULES</button>`;
  
  modules.forEach(mCode => {
    buttonsHTML += `<button class="tag-btn ${mCode.toLowerCase()}" data-filter="${mCode}">${mCode}</button>`;
  });
  
  filterContainer.innerHTML = buttonsHTML;
  
  // Add listeners
  filterContainer.querySelectorAll(".tag-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      playBeep('click');
      filterContainer.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      currentFilter = btn.getAttribute("data-filter");
      renderGrid();
    });
  });
}

// Render grid cards
function renderGrid() {
  const gridContainer = document.getElementById("grid-container");
  const resultsCountSpan = document.getElementById("results-count-val");
  
  // Filter logic
  let filteredData = HTB_DATA.filter(item => {
    // Check Module Filter
    const matchesFilter = currentFilter === "ALL" || item.modulCode === currentFilter;
    return matchesFilter;
  });
  
  resultsCountSpan.textContent = filteredData.length;
  
  if (filteredData.length === 0) {
    gridContainer.innerHTML = `
      <div class="no-results">
        <h3>[!] KEINE DATEN GEFUNDEN</h3>
        <p>Keine Mappings für diese Auswahl vorhanden.</p>
      </div>
    `;
    return;
  }
  
  let cardsHTML = "";
  filteredData.forEach(item => {
    const isSelected = selectedItemId === item.id ? "selected" : "";
    cardsHTML += `
      <div class="cyber-card ${isSelected}" data-id="${item.id}">
        <div class="card-header">
          <h3 class="card-title">${item.sectionHTB}</h3>
          <span class="card-badge badge-${item.modulCode}">${item.modulCode}</span>
        </div>
        <div class="card-body">
          "${item.sentenceHTB}"
        </div>
        <div class="card-footer">
          <span class="card-agenda">${item.agenda.split(":")[0]}</span>
          <span class="card-more">ÖFFNEN &gt;</span>
        </div>
      </div>
    `;
  });
  
  gridContainer.innerHTML = cardsHTML;
  
  // Add Event Listeners to Cards
  gridContainer.querySelectorAll(".cyber-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.getAttribute("data-id"));
      openDetailDrawer(id);
    });
  });
}

// Format list items for display
function formatListItems(stringText) {
  if (!stringText || stringText.trim() === "" || stringText.trim() === "-") {
    return `<span class="empty-text">Keine Kompetenzen definiert.</span>`;
  }
  
  // Split on semicolons or newlines
  const items = stringText.split(";").map(i => i.trim()).filter(i => i.length > 0);
  
  let listHTML = `<div class="competency-list">`;
  items.forEach(item => {
    listHTML += `<div class="competency-item">${item}</div>`;
  });
  listHTML += `</div>`;
  
  return listHTML;
}

// Details Drawer Interactions
const detailDrawer = document.getElementById("detail-drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");

function openDetailDrawer(id) {
  const node = HTB_DATA.find(item => item.id === id);
  if (!node) return;
  
  selectedItemId = id;
  playBeep('open');
  
  // Highlight card in grid
  document.querySelectorAll(".cyber-card").forEach(c => {
    c.classList.remove("selected");
    if (parseInt(c.getAttribute("data-id")) === id) {
      c.classList.add("selected");
    }
  });
  
  addTerminalLog(`Loading details for: ${node.sectionHTB}`, "action");
  
  // Populate Drawer Data
  document.getElementById("drawer-htb-section").textContent = node.sectionHTB;
  document.getElementById("drawer-htb-quote").textContent = `"${node.sentenceHTB}"`;
  
  document.getElementById("drawer-hslu-module").textContent = node.modul;
  document.getElementById("drawer-module-desc").textContent = node.modulkurzbeschrieb;
  document.getElementById("drawer-agenda").textContent = node.agenda;
  
  // Map Competencies
  document.getElementById("drawer-abschluss").innerHTML = formatListItems(node.abschlusskompetenzen);
  document.getElementById("drawer-fach").innerHTML = formatListItems(node.fachkompetenzen);
  document.getElementById("drawer-methoden").innerHTML = formatListItems(node.methodenkompetenzen);
  document.getElementById("drawer-personal").innerHTML = formatListItems(node.personalkompetenz);
  
  // Open Drawer UI elements
  detailDrawer.classList.add("open");
  drawerBackdrop.classList.add("active");
}

function closeDetailDrawer() {
  selectedItemId = null;
  playBeep('close');
  
  // De-highlight cards
  document.querySelectorAll(".cyber-card").forEach(c => c.classList.remove("selected"));
  
  detailDrawer.classList.remove("open");
  drawerBackdrop.classList.remove("active");
}

// Clear filter click
document.getElementById("btn-clear-filters").addEventListener("click", () => {
  playBeep('click');
  currentFilter = "ALL";
  
  const filterBtns = document.getElementById("filter-container").querySelectorAll(".tag-btn");
  filterBtns.forEach(b => b.classList.remove("active"));
  if (filterBtns[0]) filterBtns[0].classList.add("active");
  
  renderGrid();
});

// Close drawer listeners
document.getElementById("btn-close-drawer").addEventListener("click", closeDetailDrawer);
drawerBackdrop.addEventListener("click", closeDetailDrawer);


// Audio feedback toggle listener
const btnAudio = document.getElementById("btn-toggle-audio");
btnAudio.addEventListener("click", () => {
  soundActive = !soundActive;
  
  if (soundActive) {
    btnAudio.classList.add("active");
    btnAudio.querySelector(".toggle-status").textContent = "ON";
    initAudio();
    playBeep('success');
  } else {
    btnAudio.classList.remove("active");
    btnAudio.querySelector(".toggle-status").textContent = "OFF";
  }
});

// Initial boot sequence
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    buildFilters();
    renderGrid();
  }, 300);
});
