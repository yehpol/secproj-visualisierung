// SECPROJ // HTB-HSLU Mapping Console
// Application Logic

// Global Error Handler for diagnostics
window.addEventListener('error', function(e) {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.bottom = '20px';
  errDiv.style.left = '20px';
  errDiv.style.background = 'rgba(255, 0, 100, 0.95)';
  errDiv.style.color = 'white';
  errDiv.style.padding = '15px 20px';
  errDiv.style.zIndex = '99999';
  errDiv.style.fontFamily = 'monospace';
  errDiv.style.fontSize = '0.85rem';
  errDiv.style.borderRadius = '4px';
  errDiv.style.border = '2px solid #ff007f';
  errDiv.style.boxShadow = '0 0 20px rgba(255, 0, 127, 0.5)';
  errDiv.style.maxWidth = '600px';
  
  const filename = e.filename ? e.filename.split('/').pop() : 'inline/local';
  errDiv.innerHTML = `
    <div style="font-weight:bold; margin-bottom: 5px;">[!] RUNTIME ERROR DETECTED</div>
    <div style="opacity: 0.9; margin-bottom: 8px;">${e.message}</div>
    <div style="font-size:0.75rem; opacity: 0.7;">File: ${filename}:${e.lineno}:${e.colno}</div>
  `;
  document.body.appendChild(errDiv);
});

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
  
  // Extract unique module codes (excluding no-match rows)
  const modules = Array.from(new Set(HTB_DATA.map(item => item.modulCode)))
    .filter(mCode => mCode && mCode !== "-")
    .sort();
  
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
  const resultsCountSpan = document.getElementById("results-count-val");
  const mainContent = document.getElementById("main-content");
  
  // Filter and group data by HTB Module
  const getFilteredData = (moduleNum) => {
    return HTB_DATA.filter(item => 
      item.htbModule === moduleNum && 
      (currentFilter === "ALL" || item.modulCode === currentFilter)
    );
  };

  const filteredMods = [];
  let totalMatches = 0;
  for (let m = 1; m <= 15; m++) {
    const list = getFilteredData(m);
    filteredMods.push(list);
    totalMatches += list.length;
  }
  resultsCountSpan.textContent = totalMatches;
  
  // Function to build HTML for a list of items
  const buildCardsHTML = (items) => {
    let html = "";
    items.forEach(item => {
      const isSelected = selectedItemId === item.id ? "selected" : "";
      const badgeClass = item.modulCode === "-" ? "badge-no-match" : `badge-${item.modulCode}`;
      html += `
        <div class="cyber-card ${isSelected} match-${item.matchType}" data-id="${item.id}">
          <div class="card-header">
            <h3 class="card-title">${item.sectionHTB}</h3>
            <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
              <span class="match-indicator ${item.matchType}">
                ${item.matchType === 'green' ? 'MATCH' : item.matchType === 'yellow' ? 'TEILWEISE' : 'KEIN MATCH'}
              </span>
              <span class="card-badge ${badgeClass}">${item.modulCode}</span>
            </div>
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
    return html;
  };
  
  // Toggle visibility of each module section based on match counts
  const updateSection = (modNum, filteredList) => {
    const sectionEl = document.getElementById(`section-module-${modNum}`);
    const gridEl = document.getElementById(`grid-module-${modNum}`);
    
    if (filteredList.length === 0) {
      if (sectionEl) sectionEl.classList.add("hidden");
      if (gridEl) gridEl.innerHTML = "";
    } else {
      if (sectionEl) sectionEl.classList.remove("hidden");
      if (gridEl) gridEl.innerHTML = buildCardsHTML(filteredList);
    }
  };
  
  for (let m = 1; m <= 15; m++) {
    updateSection(m, filteredMods[m - 1]);
  }
  
  // Handle case where no items match at all globally
  const noResultsEl = document.getElementById("global-no-results");
  if (totalMatches === 0) {
    if (!noResultsEl) {
      const alertDiv = document.createElement("div");
      alertDiv.id = "global-no-results";
      alertDiv.className = "no-results";
      alertDiv.innerHTML = `
        <h3>[!] KEINE DATEN GEFUNDEN</h3>
        <p>Keine Mappings für diese Auswahl vorhanden.</p>
      `;
      mainContent.appendChild(alertDiv);
    }
  } else {
    if (noResultsEl) {
      mainContent.removeChild(noResultsEl);
    }
  }
  
  // Add Event Listeners to Cards
  document.querySelectorAll(".cyber-card").forEach(card => {
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
  
  // Reset HSLU Tag buttons
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

// Floating sidebar active chapter highlight on scroll (ScrollSpy)
function updateActiveSidebarItem() {
  const sections = Array.from({length: 15}, (_, i) => i + 1).map(modNum => document.getElementById(`section-module-${modNum}`));
  const sidebarItems = document.querySelectorAll(".book-index-sidebar .index-item");
  
  let currentActiveIndex = 0;
  
  // Check if we are scrolled to the bottom of the page
  const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);
  const isAtTop = window.scrollY < 100;
  
  if (isAtTop) {
    currentActiveIndex = 0;
  } else if (isAtBottom) {
    // Find the last visible section
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i] && !sections[i].classList.contains("hidden")) {
        currentActiveIndex = i;
        break;
      }
    }
  } else {
    // Find the section that is closest to the top area of the viewport (e.g. crossing 120px)
    let minDiff = Infinity;
    sections.forEach((section, idx) => {
      if (!section || section.classList.contains("hidden")) return;
      const rect = section.getBoundingClientRect();
      // If the section has entered the upper portion of the viewport
      if (rect.top <= 300 && rect.bottom >= 50) {
        const diff = Math.abs(rect.top - 80);
        if (diff < minDiff) {
          minDiff = diff;
          currentActiveIndex = idx;
        }
      }
    });
  }
  
  sidebarItems.forEach((item, idx) => {
    if (idx === currentActiveIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// Sidebar index item click logic
function initSidebarIndexClicks() {
  const sidebarItems = document.querySelectorAll(".book-index-sidebar .index-item");
  sidebarItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      playBeep('click');
      const targetId = item.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Initial boot sequence helper
function boot() {
  buildFilters();
  renderGrid();
  initSidebarIndexClicks();
  window.addEventListener("scroll", updateActiveSidebarItem);
  updateActiveSidebarItem(); // Run once initially
}

// Handle loading states safely
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(boot, 100);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(boot, 300);
  });
}
