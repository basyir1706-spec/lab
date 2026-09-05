/* ═══════════════════════════════════════════════════════════
   SISTRAK LAB 3 — JAVASCRIPT (FULLY FIXED & CLEANED)
   ═══════════════════════════════════════════════════════════ */

// ─── 1. MASTER LAB DATA ──────────────────────────────────
let labsData = [
  { id:'CSDL-01', code:'CSDL 1', name:'Computer System & Digital Lab 1', floor:'Ground Floor', status:'Tersedia', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
  { id:'CSDL-02', code:'CSDL 2', name:'Computer System & Digital Lab 2', floor:'Ground Floor', status:'Tersedia', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
  { id:'CNL-01',  code:'CNL',    name:'Computer Network Lab',           floor:'Ground Floor', status:'Tersedia', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
  { id:'ILL-01',  code:'ILL 1',  name:'Industrial LED Lab 1',           floor:'Ground Floor', status:'Digunakan', currentUser:'Pn. Rohana', role:'Pensyarah Kanan', startTime:'08:30 AM', endTime:'10:30 AM', isCurrentUser:true, isOverdue:false },
  { id:'ILL-02',  code:'ILL 2',  name:'Industrial LED Lab 2',           floor:'Ground Floor', status:'Penyelenggaraan', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
  { id:'ADL-01',  code:'ADL 1',  name:'Application Development Lab 1',  floor:'Aras 1', status:'Tersedia', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
  { id:'ADL-02',  code:'ADL 2',  name:'Application Development Lab 2',  floor:'Aras 1', status:'Digunakan', currentUser:'En. Khairul', role:'Jurutera Komputer', startTime:'09:00 AM', endTime:'11:00 AM', isCurrentUser:false, isOverdue:false },
  { id:'ADL-03',  code:'ADL 3',  name:'Application Development Lab 3',  floor:'Aras 1', status:'Tersedia', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
  { id:'ADL-04',  code:'ADL 4',  name:'Application Development Lab 4',  floor:'Aras 1', status:'Tersedia', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
  { id:'PL-01',   code:'PL 1',   name:'Project Lab 1',                  floor:'Aras 1', status:'Tersedia', currentUser:null, startTime:null, endTime:null, isCurrentUser:false, isOverdue:false },
];

let usageRecords = [
  { id:'rec-01', labCode:'ILL 1', labName:'Industrial LED Lab 1', user:'Pn. Rohana', role:'Pensyarah Kanan', statusType:'in-use', startTime:'08:30 AM', endTime:'10:30 AM', isCurrentUser:true, isOverdue:false },
  { id:'rec-04', labCode:'ADL 2', labName:'Application Development Lab 2', user:'En. Khairul', role:'Jurutera Komputer', statusType:'in-use', startTime:'09:00 AM', endTime:'11:00 AM', isCurrentUser:false, isOverdue:false },
  { id:'rec-02', labCode:'CSDL 1', labName:'Computer System & Digital Lab 1', user:'En. Khairul', role:'Jurutera', statusType:'completed', startTime:'08:00 AM', endTime:'09:30 AM', isCurrentUser:false, isOverdue:false },
  { id:'rec-03', labCode:'CNL', labName:'Computer Network Lab', user:'Pelajar Sem 4', role:'Amali Rangkaian', statusType:'completed', startTime:'08:00 AM', endTime:'10:00 AM', isCurrentUser:false, isOverdue:false },
];

let damageReports = [
  { id:'TK-101', lab:'ILL 1', item:'Oscilloscope Ch-2 Rosak', reporter:'Pn. Rohana', severity:'Sederhana', details:'Channel 2 noise tinggi.', status:'Sedang Dibaiki', date:'04 Ogos 2026' },
  { id:'TK-102', lab:'ILL 2', item:'Penghawa Dingin Unit B', reporter:'En. Razak', severity:'Kritikal', details:'Kompresor berbunyi, udara tak sejuk.', status:'Menunggu Alat Ganti', date:'03 Ogos 2026' },
];

let expandedLabId = null; // currently expanded lab in right panel
let selectedCheckinLabId = 'CNL-01';
let currentCalendarDay = 20;

// ─── 2. INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDateStrip();
  renderMetricCards(false);
  renderUsageTable();
  renderProgressBars();
  renderCompactLabList();
  renderDamageTable();
  renderManagementLabs();
  populateTeknikalModalLabs();
  renderTeknikalStats();
  if (window.lucide) window.lucide.createIcons();
});

// ─── 3. NAV SWITCHING (NO LAYOUT SHIFT) ──────────────────
function switchNavView(viewName) {
  ['dashboard','management','teknikal','profile'].forEach(v => {
    const el = document.getElementById('view' + v.charAt(0).toUpperCase() + v.slice(1));
    if (el) el.classList.toggle('hidden', v !== viewName);
  });

  // Update active nav link — all keep same class structure, just toggle .active
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
    const iconBox = link.querySelector('.nav-icon-box');
    if (iconBox) iconBox.classList.remove('active-icon');
  });
  const activeLink = document.getElementById('nav' + viewName.charAt(0).toUpperCase() + viewName.slice(1));
  if (activeLink) {
    activeLink.classList.add('active');
    const iconBox = activeLink.querySelector('.nav-icon-box');
    if (iconBox) iconBox.classList.add('active-icon');
  }

  const bc = document.getElementById('breadcrumbCurrent');
  const pt = document.getElementById('pageTitleHeading');
  const titles = { dashboard:['Dashboard','Dashboard Pengurusan Lab'], management:['Pengurusan Lab','Direktori & Pengurusan Makmal'], teknikal:['Teknikal','Aduan & Laporan Kerosakan'], profile:['Profile','Profil Pengguna'] };
  if (bc) bc.textContent = titles[viewName]?.[0] || viewName;
  if (pt) pt.textContent = titles[viewName]?.[1] || viewName;
  if (window.lucide) window.lucide.createIcons();
}

// ─── 4. METRIC CARDS (ANIMATED SLIDE-UP NUMBERS) ────────
function renderMetricCards(animate) {
  const total = labsData.length;
  const available = labsData.filter(l => l.status === 'Tersedia').length;
  const inUse = labsData.filter(l => l.status === 'Digunakan').length;
  const unavailable = labsData.filter(l => l.status === 'Penyelenggaraan').length;

  animateMetricNumber('metricTotal', total, animate);
  animateMetricNumber('metricAvailable', available, animate);
  animateMetricNumber('metricInUse', inUse, animate);
  animateMetricNumber('metricUnavailable', unavailable, animate);
}

function animateMetricNumber(elId, newVal, animate) {
  const el = document.getElementById(elId);
  if (!el) return;
  const oldVal = el.textContent;
  if (!animate || oldVal === String(newVal)) {
    el.textContent = newVal;
    return;
  }
  // Slide old out, then slide new in
  el.classList.add('animating-out');
  setTimeout(() => {
    el.textContent = newVal;
    el.classList.remove('animating-out');
    el.classList.add('animating-in');
    setTimeout(() => el.classList.remove('animating-in'), 300);
  }, 250);
}

// ─── 5. USAGE TABLE (CURRENT USER PINNED TOP, CLEAN) ────
function renderUsageTable() {
  const tbody = document.getElementById('usageTableBody');
  if (!tbody) return;

  const sorted = [...usageRecords].sort((a, b) => {
    if (a.isCurrentUser && !b.isCurrentUser) return -1;
    if (!a.isCurrentUser && b.isCurrentUser) return 1;
    if (a.statusType === 'in-use' && b.statusType !== 'in-use') return -1;
    if (a.statusType !== 'in-use' && b.statusType === 'in-use') return 1;
    return 0;
  });

  tbody.innerHTML = sorted.map(rec => {
    const isPinned = rec.isCurrentUser && rec.statusType === 'in-use';
    const isOverdue = rec.isOverdue;

    // STATUS — clean, no big colored boxes
    let statusHTML = '';
    if (rec.statusType === 'in-use') {
      if (isOverdue) {
        statusHTML = `<span class="badge-overdue px-2 py-0.5 rounded-full text-[10px]"><i class="w-3 h-3 text-rose-500" data-lucide="alert-triangle"></i> Tamat Tempoh (+25m)</span>
          <div class="mt-0.5">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600">
              <i class="w-3.5 h-3.5 text-orange-600" data-lucide="key-round"></i>
              <span>Masuk ${rec.startTime}</span>
            </span>
            <span class="block text-[10px] text-slate-400 font-medium pl-5">Hingga ${rec.endTime}</span>
          </div>`;
      } else {
        statusHTML = `<div>
          <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600">
            <i class="w-3.5 h-3.5 text-orange-600" data-lucide="key-round"></i>
            <span>Masuk ${rec.startTime}</span>
          </span>
          <span class="block text-[10px] text-slate-400 mt-0.5 font-medium pl-5">Hingga ${rec.endTime}</span>
        </div>`;
      }
    } else {
      statusHTML = `<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><i class="w-3.5 h-3.5 text-slate-400" data-lucide="log-out"></i> Keluar ${rec.endTime}</span>`;
    }

    // ACTION
    let actionHTML = '';
    if (isPinned) {
      actionHTML = `<button onclick="checkoutActiveLab('${rec.labCode}')" class="inline-flex items-center gap-1.5 text-[11px] font-bold text-white btn-mesh-gradient px-3 py-1 rounded-lg shadow-sm transition-all"><i class="w-3.5 h-3.5 text-white" data-lucide="key-round"></i> Pulang Kunci</button>`;
    } else if (rec.statusType === 'in-use') {
      actionHTML = `<button onclick="openTimetableModal('${rec.labCode}')" class="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors">Jadual</button>`;
    } else {
      actionHTML = `<span class="text-[10px] text-slate-400">Selesai</span>`;
    }

    return `<tr class="${isPinned ? 'row-pinned-active' : 'hover:bg-slate-50/70 transition-colors'}">
      <td class="py-3.5 pl-5 pr-3 w-28 sm:w-32">
        <span class="font-extrabold text-slate-800 text-xs">${rec.labCode}</span>
      </td>
      <td class="py-3.5 px-3">
        <span class="font-bold text-slate-700 text-xs block">${rec.user}</span>
        <span class="text-[10px] text-slate-400">${rec.role || ''}</span>
      </td>
      <td class="py-3.5 px-3">${statusHTML}</td>
      <td class="py-3.5 pl-3 pr-5 text-right">${actionHTML}</td>
    </tr>`;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

// ─── 6. DATE STRIP ──────────────────────────────────────
function renderDateStrip() {
  const c = document.getElementById('dateStripContainer');
  if (!c) return;
  const days = [{d:'SUN',n:19},{d:'MON',n:20},{d:'TUE',n:21},{d:'WED',n:22},{d:'THU',n:23},{d:'FRI',n:24},{d:'SAT',n:25}];
  c.innerHTML = days.map(x => {
    const act = x.n === currentCalendarDay;
    return `<button onclick="selectCalendarDay(${x.n})" class="date-strip-btn ${act?'active':''}">
      <span class="text-[9px] uppercase ${act?'text-slate-300':'text-slate-400'} font-semibold">${x.d}</span>
      <span class="text-sm font-extrabold mt-0.5">${x.n}</span>
    </button>`;
  }).join('');
}

function selectCalendarDay(n) { currentCalendarDay = n; renderDateStrip(); showToast('Tarikh dipilih: ' + n + ' Ogos 2026'); }
function navigateDateStrip(dir) { currentCalendarDay += dir; if (currentCalendarDay < 1) currentCalendarDay = 31; if (currentCalendarDay > 31) currentCalendarDay = 1; renderDateStrip(); }

// ─── 7. PROGRESS BARS (ANIMATED) ────────────────────────
function renderProgressBars() {
  const gf = labsData.filter(l => l.floor === 'Ground Floor');
  const a1 = labsData.filter(l => l.floor === 'Aras 1');
  const gfUse = gf.filter(l => l.status === 'Digunakan').length;
  const a1Use = a1.filter(l => l.status === 'Digunakan').length;

  const elGf = document.getElementById('statsArasBawahRatio');
  const elA1 = document.getElementById('statsAras1Ratio');
  const elA2 = document.getElementById('statsAras2Ratio');

  if (elGf) elGf.innerHTML = `${gfUse} <span class="font-normal text-slate-400 text-[10px]">/ ${gf.length} Lab</span>`;
  if (elA1) elA1.innerHTML = `${a1Use} <span class="font-normal text-slate-400 text-[10px]">/ ${a1.length} Lab</span>`;
  if (elA2) elA2.innerHTML = `0 <span class="font-normal text-slate-400 text-[10px]">/ 0 Lab</span>`;

  // Animate bar width
  setTimeout(() => {
    setBarWidth('barArasBawah', (gfUse / (gf.length || 1)) * 100);
    setBarWidth('barAras1', (a1Use / (a1.length || 1)) * 100);
    setBarWidth('barAras2', 0);
  }, 50);
}

function setText(id, txt) { const e = document.getElementById(id); if (e) e.textContent = txt; }
function setBarWidth(id, pct) { const e = document.getElementById(id); if (e) e.style.width = Math.round(pct) + '%'; }

// ─── 8. COMPACT LAB LIST & 0.5s HOVER SELF-EXPANDING CARD ───
let hoverExpandTimer = null;
let currentHoveredLabId = null;
let collapseTimer = null;
let currentLabSearchQuery = '';

function renderLabCardHtml(lab) {
  const isExp = (expandedLabId === lab.id);
  const isUsedByOther = (lab.status === 'Digunakan' && !lab.isCurrentUser);
  const isMaintenance = (lab.status === 'Penyelenggaraan');
  const isUnselectable = isUsedByOther || isMaintenance;

  // Status pill text
  let pillHTML = '';
  if (lab.status === 'Tersedia') {
    pillHTML = `<span class="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Tersedia</span>`;
  } else if (lab.status === 'Digunakan') {
    if (lab.isOverdue) {
      pillHTML = `<span class="badge-overdue px-1.5 py-0.5 rounded text-[9px]">(Tamat Tempoh)</span>`;
    } else if (isUsedByOther) {
      pillHTML = `<span class="flex items-center gap-1 text-[9px] font-semibold text-yellow-800/80"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>Digunakan</span>`;
    } else {
      pillHTML = `<span class="flex items-center gap-1 text-[9px] font-bold text-yellow-800"><span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Digunakan</span>`;
    }
  } else {
    pillHTML = `<span class="flex items-center gap-1 text-[9px] font-semibold text-slate-400"><span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Servis</span>`;
  }

  if (!isExp) {
    if (isUnselectable) {
      // ─── MAKMAL DIGUNAKAN OLEH USER LAIN / SERVIS: DIMMED & UNSELECTABLE ───
      return `
        <div 
          class="lab-rect-item lab-rect-disabled" 
          id="rect-${lab.id}"
          title="${isUsedByOther ? 'Makmal sedang digunakan oleh pengguna lain' : 'Makmal dalam penyelenggaraan'}"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">${lab.code}</span>
            ${pillHTML}
          </div>
        </div>
      `;
    } else {
      // ─── COMPACT RECTANGLE TERSEDIA / SESI KITA (Hover 0.5s kembang) ───
      return `
        <div 
          class="lab-rect-item" 
          id="rect-${lab.id}"
          onmouseenter="handleLabHoverEnter('${lab.id}')"
          onmouseleave="handleLabHoverLeave('${lab.id}')"
          onclick="toggleLabExpandClick('${lab.id}')"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-800">${lab.code}</span>
            ${pillHTML}
          </div>
        </div>
      `;
    }
  } else {
    // ─── THE SAME CARD EXPANDED (HANYA MEMANJANG KE BAWAH, KEKAL BENTUK LAJUR) ───
    let actionBtn = '';
    if (lab.status === 'Digunakan' && lab.isCurrentUser) {
      actionBtn = `
        <button onclick="event.stopPropagation(); checkoutActiveLab('${lab.code}')" class="flex-1 py-1.5 px-2 text-[10px] font-bold text-white btn-mesh-gradient rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
          <i class="w-3 h-3 text-white" data-lucide="key-round"></i>
          <span>Pulang Kunci</span>
        </button>
      `;
    } else if (lab.status === 'Tersedia') {
      actionBtn = `
        <button onclick="event.stopPropagation(); openCheckinModalForLab('${lab.id}')" class="flex-1 py-1.5 px-2 text-[10px] font-bold text-white btn-mesh-gradient rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
          <i class="w-3 h-3 text-white" data-lucide="key-round"></i>
          <span>Check-In</span>
        </button>
      `;
    }

    return `
      <div 
        class="lab-rect-item is-expanded" 
        id="rect-${lab.id}"
        onmouseenter="handleLabHoverEnter('${lab.id}')"
        onmouseleave="handleLabHoverLeave('${lab.id}')"
      >
        <!-- Top Row: Code & Pill -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-slate-900">${lab.code}</span>
          ${pillHTML}
        </div>

        <!-- Floor / Kod ringkas -->
        <p class="text-[10px] text-slate-400 mt-0.5">${lab.floor}</p>

        <!-- Detail Sesi / Status (Simple & kemas) -->
        <div class="expanded-content-slide mt-2 pt-1.5 border-t border-slate-100">
          ${lab.status === 'Digunakan' ? `
            <div class="bg-yellow-50/90 border border-yellow-200/80 rounded-lg p-2 mb-2">
              <div class="flex items-center gap-1.5 mb-1">
                <div class="w-5 h-5 rounded-full bg-yellow-400 text-yellow-950 font-black text-[8px] flex items-center justify-center shrink-0">
                  ${lab.currentUser ? lab.currentUser.substring(0, 2).toUpperCase() : 'PR'}
                </div>
                <span class="text-[11px] font-bold text-slate-800 truncate">${lab.currentUser}</span>
              </div>
              <span class="text-[9px] text-slate-500 block leading-none pl-6">${lab.startTime} – ${lab.endTime}</span>
            </div>
          ` : lab.status === 'Tersedia' ? `
            <div class="bg-emerald-50/80 border border-emerald-200/60 rounded-lg p-2 mb-2 flex items-center gap-1.5 text-emerald-700">
              <i class="w-3.5 h-3.5 text-emerald-600 shrink-0" data-lucide="check-circle-2"></i>
              <span class="text-[10px] font-bold">Sedia Digunakan</span>
            </div>
          ` : `
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-2 text-slate-500 text-[10px]">
              Dalam Penyelenggaraan
            </div>
          `}
        </div>

        <!-- Action Buttons (Simple, clean, side-by-side) -->
        <div class="expanded-content-slide flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <button onclick="event.stopPropagation(); openTimetableModal('${lab.code}')" class="flex-1 py-1.5 px-2 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center">
            Jadual
          </button>
          ${actionBtn}
        </div>
      </div>
    `;
  }
}

function renderCompactLabList(filteredList) {
  const grid = document.getElementById('labCompactGrid');
  if (!grid) return;

  let list = filteredList;
  if (!list) {
    if (currentLabSearchQuery) {
      const q = currentLabSearchQuery;
      list = labsData.filter(l => l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.floor.toLowerCase().includes(q));
    } else {
      list = labsData;
    }
  }

  if (!list.length) {
    grid.innerHTML = '<div class="col-span-2 text-center text-xs text-slate-400 py-4">Tiada makmal dijumpai</div>';
    return;
  }

  let col1Html = '';
  let col2Html = '';

  list.forEach((lab, index) => {
    const cardHtml = renderLabCardHtml(lab);
    if (index % 2 === 0) {
      col1Html += cardHtml;
    } else {
      col2Html += cardHtml;
    }
  });

  // Render into 2 independent vertical stacks (.lab-col-stack) so expanding one card never creates gaps under adjacent cards!
  grid.innerHTML = `
    <div class="lab-col-stack">${col1Html}</div>
    <div class="lab-col-stack">${col2Html}</div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

// 0.5s Hover Detection (Sentuh selama 0.5 saat untuk membesar)
function handleLabHoverEnter(labId) {
  // Clear any pending collapse timer
  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }

  if (expandedLabId === labId) return;
  currentHoveredLabId = labId;

  if (hoverExpandTimer) clearTimeout(hoverExpandTimer);

  hoverExpandTimer = setTimeout(() => {
    if (currentHoveredLabId === labId) {
      expandedLabId = labId;
      renderCompactLabList();
    }
  }, 500); // 0.5 saat
}

// Hover Leave: Bila kursor keluar dari komponen, kembali kepada bentuk asal!
function handleLabHoverLeave(labId) {
  if (currentHoveredLabId === labId) {
    if (hoverExpandTimer) {
      clearTimeout(hoverExpandTimer);
      hoverExpandTimer = null;
    }
    currentHoveredLabId = null;
  }

  // Jika kursor keluar dari kad yang sedang kembang, kembalikan ke bentuk asal
  if (expandedLabId === labId) {
    if (collapseTimer) clearTimeout(collapseTimer);
    collapseTimer = setTimeout(() => {
      expandedLabId = null;
      renderCompactLabList();
    }, 250);
  }
}

function onLabGridMouseLeave() {
  if (hoverExpandTimer) {
    clearTimeout(hoverExpandTimer);
    hoverExpandTimer = null;
  }
  currentHoveredLabId = null;
  if (expandedLabId) {
    if (collapseTimer) clearTimeout(collapseTimer);
    collapseTimer = setTimeout(() => {
      expandedLabId = null;
      renderCompactLabList();
    }, 250);
  }
}

function toggleLabExpandClick(labId) {
  if (hoverExpandTimer) {
    clearTimeout(hoverExpandTimer);
    hoverExpandTimer = null;
  }
  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }
  expandedLabId = (expandedLabId === labId) ? null : labId;
  renderCompactLabList();
}

// ─── NATIVE CALENDAR PICKER ─────────────────────────────
function openNativeCalendarPicker() {
  const input = document.getElementById('nativeCalendarInput');
  if (input) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.click();
    }
  }
}

function onCalendarDateSelected(val) {
  if (!val) return;
  const d = new Date(val);
  if (isNaN(d.getTime())) return;
  const dayNum = d.getDate();
  const months = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
  const mName = months[d.getMonth()];
  const yr = d.getFullYear();

  currentCalendarDay = dayNum;
  const disp = document.getElementById('currentMonthYearDisplay');
  if (disp) disp.textContent = `${mName} ${yr}`;
  renderDateStrip();
  showToast(`Tarikh dipilih: ${dayNum} ${mName} ${yr}`);
}

// ─── USER SETTINGS MODAL ────────────────────────────────
function toggleUserSettingsModal() {
  const m = document.getElementById('userSettingsModal');
  if (m) {
    m.classList.toggle('hidden');
    if (window.lucide) window.lucide.createIcons();
  }
}

function closeUserSettingsModal() {
  const m = document.getElementById('userSettingsModal');
  if (m) m.classList.add('hidden');
}

function onSearchLabInput(q) {
  currentLabSearchQuery = q.trim().toLowerCase();
  if (!currentLabSearchQuery) {
    renderCompactLabList(labsData);
    return;
  }
  const filtered = labsData.filter(l => 
    l.code.toLowerCase().includes(currentLabSearchQuery) || 
    l.name.toLowerCase().includes(currentLabSearchQuery) || 
    l.floor.toLowerCase().includes(currentLabSearchQuery)
  );
  renderCompactLabList(filtered);
}

// ─── 9. CHECK-IN MODAL ──────────────────────────────────
function openCheckinModal() { renderModalLabTiles(); document.getElementById('checkinModal')?.classList.remove('hidden'); if (window.lucide) window.lucide.createIcons(); }
function openCheckinModalForLab(id) { selectedCheckinLabId = id; openCheckinModal(); }
function closeCheckinModal() { document.getElementById('checkinModal')?.classList.add('hidden'); }

function renderModalLabTiles() {
  const c = document.getElementById('modalLabTilesGrid');
  if (!c) return;
  c.innerHTML = labsData.map(lab => {
    const sel = lab.id === selectedCheckinLabId;
    const avail = lab.status === 'Tersedia';
    let tag = '', stTxt = avail ? (sel ? 'Dipilih' : 'Tersedia') : lab.status === 'Digunakan' ? 'Digunakan' : 'Servis';
    let stColor = avail ? 'text-emerald-600' : lab.status === 'Digunakan' ? 'text-yellow-800' : 'text-slate-500';
    let dotColor = avail ? 'bg-emerald-500' : lab.status === 'Digunakan' ? 'bg-yellow-500' : 'bg-slate-400';
    if (!avail) {
      const tLabel = lab.status === 'Digunakan' ? 'Penuh' : 'Servis';
      const tColor = lab.status === 'Digunakan' ? 'text-yellow-800 bg-yellow-100' : 'text-slate-500 bg-slate-100';
      tag = `<span class="text-[8px] font-extrabold ${tColor} px-1.5 py-0.5 rounded">${tLabel}</span>`;
    }
    return `<div onclick="${avail ? `selectModalTile('${lab.id}')` : ''}" class="modal-lab-tile ${sel?'selected':''} ${!avail?'disabled':''}">
      <div class="flex items-center justify-between"><span class="text-xs font-extrabold text-slate-800">${lab.code}</span>
        ${sel ? '<div class="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center"><i class="w-3 h-3" data-lucide="check"></i></div>' : tag}
      </div>
      <p class="text-[9px] text-slate-400 mt-0.5">${lab.floor}</p>
      <div class="mt-1.5 flex items-center gap-1"><span class="w-1 h-1 rounded-full ${dotColor}"></span><span class="text-[9px] font-bold ${stColor}">${stTxt}</span></div>
    </div>`;
  }).join('');
}

function selectModalTile(id) { selectedCheckinLabId = id; renderModalLabTiles(); if (window.lucide) window.lucide.createIcons(); }

// ─── 10. TIME DURATION 00:00 FORMAT ─────────────────────
function parseTimeToMin(s) { if (!s) return 120; const p = s.split(':'); return (parseInt(p[0])||0)*60 + (parseInt(p[1])||0); }
function formatMinToTime(m) { m = Math.max(30, m); return String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0'); }
function stepDurationMinutes(d) { const el = document.getElementById('inputDurationFormatted'); if (el) el.value = formatMinToTime(parseTimeToMin(el.value) + d); }
function handleDurationTextInput(el) { const v = el.value.trim(); if (/^[1-9]$/.test(v)) { el.value = '0' + v + ':00'; } }
function formatDurationOnBlur(el) { const v = el.value.trim(); if (/^[1-9]$/.test(v)) el.value = '0' + v + ':00'; else if (!v.includes(':')) { const n = parseInt(v); el.value = (!isNaN(n) && n > 0) ? '0' + n + ':00' : '02:00'; } }

function submitCheckinModal() {
  const lab = labsData.find(l => l.id === selectedCheckinLabId);
  if (!lab || lab.status !== 'Tersedia') {
    showConfirmDialog({
      title: 'Makmal Tidak Tersedia',
      message: 'Sila pilih makmal yang berstatus Tersedia untuk membuat pendaftaran check-in.',
      type: 'alert',
      confirmText: 'Faham',
      icon: 'alert-circle'
    });
    return;
  }
  const userName = document.getElementById('inputCheckinUserName')?.value.trim() || 'Pn. Rohana';
  const purpose = document.getElementById('selectCheckinPurpose')?.value || '';
  const durStr = document.getElementById('inputDurationFormatted')?.value || '02:00';
  const now = new Date();
  const startFmt = formatAMPM(now.getHours(), now.getMinutes());
  const durMin = parseTimeToMin(durStr);
  const endTotal = now.getHours() * 60 + now.getMinutes() + durMin;
  const endFmt = formatAMPM(Math.floor(endTotal/60)%24, endTotal%60);

  lab.status = 'Digunakan';
  lab.currentUser = userName;
  lab.role = purpose;
  lab.startTime = startFmt;
  lab.endTime = endFmt;
  lab.isCurrentUser = true;
  lab.isOverdue = false;

  usageRecords.unshift({
    id: 'rec-' + Date.now(),
    labCode: lab.code,
    labName: lab.name,
    user: userName,
    role: purpose,
    statusType: 'in-use',
    startTime: startFmt,
    endTime: endFmt,
    isCurrentUser: true,
    isOverdue: false
  });

  closeCheckinModal();
  expandedLabId = lab.id;
  refreshAll(true);
  showToast('Check-In Berjaya! Makmal ' + lab.code + ' diaktifkan.');
}

function formatAMPM(h, m) {
  const ap = h >= 12 ? 'PM' : 'AM';
  return String(h % 12 || 12).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' ' + ap;
}

// ─── 11. CHECKOUT (WITH SOFT CONFIRM MODAL) ─────────────
function checkoutActiveLab(code) {
  showConfirmDialog({
    title: 'Pengesahan Pemulangan Kunci',
    message: `Adakah anda pasti untuk menamatkan sesi dan memulangkan kunci bagi makmal ${code}?`,
    type: 'confirm',
    confirmText: 'Ya, Pulang Kunci',
    cancelText: 'Batal',
    icon: 'key-round',
    onConfirm: () => {
      const lab = labsData.find(l => l.code === code);
      if (lab) {
        lab.status = 'Tersedia';
        lab.currentUser = null;
        lab.startTime = null;
        lab.endTime = null;
        lab.isCurrentUser = false;
        lab.isOverdue = false;
      }
      const rec = usageRecords.find(r => r.labCode === code && r.statusType === 'in-use');
      if (rec) {
        rec.statusType = 'completed';
        rec.isCurrentUser = false;
      }
      if (expandedLabId === lab?.id) expandedLabId = null;
      refreshAll(true);
      showToast('Kunci ' + code + ' berjaya dipulangkan!');
    }
  });
}

// ─── 12. TEKNIKAL (MODAL TAB SISTEM & SENARAI ADUAN) ────
let currentTeknikalTab = 'form';

function openTeknikalModal(tab = 'form') {
  populateTeknikalModalLabs();
  renderModalDamageTable();
  switchTeknikalTab(tab);
  document.getElementById('teknikalModal')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeTeknikalModal() {
  document.getElementById('teknikalModal')?.classList.add('hidden');
}

function switchTeknikalTab(tabName) {
  currentTeknikalTab = tabName;
  const isForm = (tabName === 'form');
  document.getElementById('btnTabLaporKerosakan')?.classList.toggle('active', isForm);
  document.getElementById('btnTabSenaraiAduan')?.classList.toggle('active', !isForm);
  document.getElementById('teknikalTabForm')?.classList.toggle('hidden', !isForm);
  document.getElementById('teknikalTabList')?.classList.toggle('hidden', isForm);
  if (window.lucide) window.lucide.createIcons();
}

function populateTeknikalModalLabs() {
  const select = document.getElementById('modalReportLabSelect');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Pilih Makmal --</option>' + 
    labsData.map(l => `<option value="${l.code}">${l.code} — ${l.name}</option>`).join('');
  if (currentVal) select.value = currentVal;
}

function submitDamageReport(e) {
  e.preventDefault();
  const lab = document.getElementById('modalReportLabSelect')?.value;
  const item = document.getElementById('modalReportItemName')?.value?.trim();
  const sev = document.getElementById('modalReportSeverity')?.value;
  const det = document.getElementById('modalReportDetails')?.value?.trim();

  if (!lab || !item) {
    showConfirmDialog({
      title: 'Maklumat Tidak Lengkap',
      message: 'Sila lengkapkan pilihan makmal dan peralatan yang rosak.',
      type: 'alert',
      icon: 'alert-triangle'
    });
    return;
  }

  const newTicket = {
    id: 'TK-' + (100 + damageReports.length + 1),
    lab,
    item,
    reporter: 'Pn. Rohana',
    severity: sev,
    details: det,
    status: 'Baru',
    date: 'Hari ini'
  };

  damageReports.unshift(newTicket);
  document.getElementById('damageReportModalForm')?.reset();
  renderDamageTable();
  renderModalDamageTable();
  renderTeknikalStats();
  switchTeknikalTab('list');
  showToast('Laporan aduan ' + item + ' (' + lab + ') dihantar!');
}

function renderDamageTable() {
  const tbody = document.getElementById('damageTableBody');
  if (!tbody) return;
  tbody.innerHTML = damageReports.map(t => {
    const sevPill = t.severity === 'Kritikal' ? 'bg-rose-100 text-rose-700 border-rose-200' : t.severity === 'Sederhana' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200';
    const stPill = t.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : t.status === 'Baru' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-amber-100 text-amber-700 border-amber-200';
    return `<tr class="hover:bg-slate-50/70 transition-colors">
      <td class="py-3 font-extrabold text-slate-800">${t.id}</td>
      <td class="py-3 font-extrabold text-slate-800">${t.lab}</td>
      <td class="py-3"><span class="font-bold text-slate-800">${t.item}</span><br><span class="text-[10px] text-slate-400">${t.details}</span></td>
      <td class="py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${sevPill}">${t.severity}</span></td>
      <td class="py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${stPill}">${t.status}</span></td>
      <td class="py-3 text-right">
        ${t.status !== 'Selesai' ? `<button onclick="resolveTicket('${t.id}')" class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors">Selesai</button>` : '<span class="text-[10px] font-semibold text-slate-400">Ditutup</span>'}
      </td>
    </tr>`;
  }).join('');
  renderTeknikalStats();
  if (window.lucide) window.lucide.createIcons();
}

function renderModalDamageTable() {
  const tbody = document.getElementById('modalDamageTableBody');
  if (!tbody) return;
  tbody.innerHTML = damageReports.map(t => {
    const sevPill = t.severity === 'Kritikal' ? 'bg-rose-100 text-rose-700' : t.severity === 'Sederhana' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';
    const stPill = t.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : t.status === 'Baru' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700';
    return `<tr class="hover:bg-slate-50/70 transition-colors">
      <td class="py-2.5 font-bold text-slate-800">${t.id}</td>
      <td class="py-2.5 font-bold text-slate-800">${t.lab}</td>
      <td class="py-2.5"><span class="font-bold text-slate-800">${t.item}</span><br><span class="text-[10px] text-slate-400">${t.details}</span></td>
      <td class="py-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${sevPill}">${t.severity}</span></td>
      <td class="py-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${stPill}">${t.status}</span></td>
      <td class="py-2.5 text-right">
        ${t.status !== 'Selesai' ? `<button onclick="resolveTicket('${t.id}')" class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors">Selesai</button>` : '<span class="text-[10px] font-semibold text-slate-400">Ditutup</span>'}
      </td>
    </tr>`;
  }).join('');
}

function renderTeknikalStats() {
  const total = damageReports.length;
  const resolved = damageReports.filter(t => t.status === 'Selesai').length;
  const pending = total - resolved;

  setText('statsTeknikalTotal', total);
  setText('statsTeknikalPending', pending);
  setText('statsTeknikalResolved', resolved);
  setText('ticketCountBadge', total + ' Laporan');
  setText('tabListBadgeCount', total);
}

function resolveTicket(id) {
  const t = damageReports.find(x => x.id === id);
  if (t) {
    t.status = 'Selesai';
    renderDamageTable();
    renderModalDamageTable();
    showToast('Tiket aduan ' + id + ' telah ditandakan selesai.');
  }
}

// ─── 13. PENGURUSAN LAB CRUD & TIMETABLE ────────────────
let labTimetableMap = {};
let currentTimetableTempImage = null;

function renderManagementLabs() {
  const grid = document.getElementById('managementLabsGrid');
  if (!grid) return;

  const floorFilter = document.getElementById('mgmtFloorFilter')?.value || 'ALL';
  const statusFilter = document.getElementById('mgmtStatusFilter')?.value || 'ALL';

  let list = labsData.filter(lab => {
    if (floorFilter !== 'ALL' && lab.floor !== floorFilter) return false;
    if (statusFilter === 'Penyelenggaraan' && lab.status !== 'Penyelenggaraan') return false;
    return true;
  });

  grid.innerHTML = list.map(lab => {
    const isDiselenggara = (lab.status === 'Penyelenggaraan');

    return `
      <div class="bg-white rounded-2xl border ${isDiselenggara ? 'border-rose-300 bg-rose-50/25' : 'border-slate-200/90'} hover:border-orange-400 hover:shadow-md p-4 transition-all flex items-center justify-between gap-3 group">
        <!-- Maklumat Makmal (Simple Rectangle) -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-slate-800 tracking-tight">${lab.code}</span>
            ${isDiselenggara ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Diselenggara
              </span>
            ` : ''}
          </div>
          <h4 class="text-xs font-bold text-slate-700 truncate mt-1" title="${lab.name}">${lab.name}</h4>
          <p class="text-[11px] text-slate-400 font-medium mt-0.5">${lab.floor}</p>
        </div>

        <!-- Butang Tindakan: Sunting (Pensel) & Padam (Buang) -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="openEditLabModal('${lab.id}')" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md group-hover:scale-105" title="Sunting Maklumat">
            <i class="w-4 h-4" data-lucide="pencil"></i>
          </button>
          <button onclick="confirmDeleteLab('${lab.id}')" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-500 hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md group-hover:scale-105" title="Padam Makmal">
            <i class="w-4 h-4" data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function changeLabStatus(id, newStatus) {
  const lab = labsData.find(l => l.id === id);
  if (!lab) return;

  if (newStatus === 'Digunakan') {
    selectedCheckinLabId = id;
    openCheckinModal();
    return;
  }

  lab.status = newStatus;
  if (newStatus === 'Tersedia' || newStatus === 'Penyelenggaraan') {
    lab.currentUser = null;
    lab.startTime = null;
    lab.endTime = null;
    lab.isCurrentUser = false;
  }
  refreshAll(true);
  showToast(`Status ${lab.code} ditukar kepada ${newStatus}`);
}

// ─── MODAL CRUD: TAMBAH & EDIT MAKMAL ────────────────────
function openAddLabModal() {
  document.getElementById('labFormModalTitle').textContent = 'Tambah Makmal Baharu';
  document.getElementById('labFormModalSubtitle').textContent = 'Masukkan butiran makmal untuk pendaftaran';
  document.getElementById('labFormEditId').value = '';
  document.getElementById('labFormCode').value = '';
  document.getElementById('labFormName').value = '';
  document.getElementById('labFormFloor').value = 'Ground Floor';
  document.getElementById('labFormStatus').value = 'Tersedia';

  const ttSection = document.getElementById('labFormTimetableSection');
  if (ttSection) ttSection.classList.add('hidden');

  const delBtn = document.getElementById('labFormDeleteBtn');
  if (delBtn) delBtn.classList.add('hidden');

  document.getElementById('labFormModal')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function openEditLabModal(id) {
  const lab = labsData.find(l => l.id === id);
  if (!lab) return;

  document.getElementById('labFormModalTitle').textContent = 'Sunting Maklumat: ' + lab.code;
  document.getElementById('labFormModalSubtitle').textContent = 'Sunting nama, aras, status atau jadual makmal';
  document.getElementById('labFormEditId').value = lab.id;
  document.getElementById('labFormCode').value = lab.code;
  document.getElementById('labFormName').value = lab.name;
  document.getElementById('labFormFloor').value = lab.floor;
  document.getElementById('labFormStatus').value = (lab.status === 'Penyelenggaraan') ? 'Penyelenggaraan' : 'Tersedia';

  const ttSection = document.getElementById('labFormTimetableSection');
  if (ttSection) {
    ttSection.classList.remove('hidden');
    const ttCodeEl = document.getElementById('labFormTimetableLabCode');
    if (ttCodeEl) {
      const hasCustom = Boolean(labTimetableMap[lab.code]);
      ttCodeEl.textContent = `${lab.code} (${hasCustom ? 'Jadual Kustom' : 'Jadual Rasmi'})`;
    }
  }

  const delBtn = document.getElementById('labFormDeleteBtn');
  if (delBtn) delBtn.classList.remove('hidden');

  document.getElementById('labFormModal')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function handleViewTimetableFromForm() {
  const code = document.getElementById('labFormCode')?.value?.trim();
  if (code) openTimetableModal(code);
}

function handleUpdateTimetableFromForm() {
  const code = document.getElementById('labFormCode')?.value?.trim();
  if (code) openUpdateTimetableModal(code);
}

function closeLabFormModal() {
  document.getElementById('labFormModal')?.classList.add('hidden');
}

function handleDeleteFromEditModal() {
  const editId = document.getElementById('labFormEditId')?.value;
  if (editId) {
    confirmDeleteLab(editId);
  }
}

function confirmDeleteLab(id) {
  const lab = labsData.find(l => l.id === id);
  if (!lab) return;

  const inUseNotice = (lab.status === 'Digunakan') 
    ? `<br><br><span class="text-amber-600 font-bold">⚠️ Perhatian: Makmal ini sedang aktif digunakan oleh ${lab.currentUser || 'pengguna'}.</span>` 
    : '';

  showConfirmDialog({
    title: `Padam Makmal ${lab.code}?`,
    message: `Adakah anda pasti ingin memadamkan makmal "${lab.name}" (${lab.floor}) secara kekal? Tindakan ini tidak boleh dibatalkan.${inUseNotice}`,
    type: 'danger',
    confirmText: 'Padam Makmal',
    cancelText: 'Batal',
    icon: 'trash-2',
    onConfirm: () => {
      deleteLab(id);
    }
  });
}

function deleteLab(id) {
  const index = labsData.findIndex(l => l.id === id);
  if (index === -1) return;
  const deletedLab = labsData[index];

  // 1. Buang daripada rekod labsData
  labsData.splice(index, 1);

  // 2. Buang jadual kustom jika ada
  if (labTimetableMap[deletedLab.code]) {
    delete labTimetableMap[deletedLab.code];
  }

  // 3. Bersihkan rekod penggunaan aktif bagi makmal ini
  usageRecords = usageRecords.filter(r => r.labCode !== deletedLab.code);

  // 4. Tutup modal suntingan sekiranya sedang dibuka
  closeLabFormModal();

  // 5. Kemaskini semua paparan & statistik
  refreshAll(true);
  showToast(`Makmal ${deletedLab.code} berjaya dipadam.`);
}

function handleSaveLabForm(e) {
  e.preventDefault();
  const editId = document.getElementById('labFormEditId')?.value;
  const code = document.getElementById('labFormCode')?.value?.trim();
  const name = document.getElementById('labFormName')?.value?.trim();
  const floor = document.getElementById('labFormFloor')?.value;
  const status = document.getElementById('labFormStatus')?.value;

  if (!code || !name) return;

  if (editId) {
    // Edit existing lab
    const lab = labsData.find(l => l.id === editId);
    if (lab) {
      lab.code = code;
      lab.name = name;
      lab.floor = floor;
      lab.status = status;
      if (status === 'Penyelenggaraan') {
        lab.currentUser = null;
        lab.startTime = null;
        lab.endTime = null;
        lab.isCurrentUser = false;
        lab.isOverdue = false;
      }
      showToast('Maklumat makmal ' + code + ' berjaya dikemaskini!');
    }
  } else {
    // Add new lab
    const newId = code.replace(/\s+/g, '-').toUpperCase() + '-' + Date.now().toString().slice(-3);
    const newLab = {
      id: newId,
      code,
      name,
      floor,
      status,
      currentUser: null,
      startTime: null,
      endTime: null,
      isCurrentUser: false,
      isOverdue: false
    };
    labsData.push(newLab);
    showToast('Makmal ' + code + ' berjaya didaftarkan!');
  }

  closeLabFormModal();
  populateTeknikalModalLabs();
  refreshAll(true);
}

// ─── MODAL: UPDATE JADUAL WAKTU ──────────────────────────
function openUpdateTimetableModal(code) {
  const lab = labsData.find(l => l.code === code);
  document.getElementById('updateTimetableLabCode').value = code;
  document.getElementById('updateTimetableModalTitle').textContent = 'Kemaskini Jadual: ' + code;
  
  const currentImg = labTimetableMap[code] || 'jadual(default).png';
  currentTimetableTempImage = currentImg;
  const preview = document.getElementById('updateTimetablePreview');
  if (preview) preview.src = currentImg;

  const fileInput = document.getElementById('timetableFileInput');
  if (fileInput) fileInput.value = '';

  document.getElementById('updateTimetableModal')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeUpdateTimetableModal() {
  document.getElementById('updateTimetableModal')?.classList.add('hidden');
}

function handleTimetableFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    currentTimetableTempImage = evt.target.result;
    const preview = document.getElementById('updateTimetablePreview');
    if (preview) preview.src = currentTimetableTempImage;
  };
  reader.readAsDataURL(file);
}

function resetToDefaultTimetable() {
  currentTimetableTempImage = 'jadual(default).png';
  const preview = document.getElementById('updateTimetablePreview');
  if (preview) preview.src = currentTimetableTempImage;
  const fileInput = document.getElementById('timetableFileInput');
  if (fileInput) fileInput.value = '';
}

function saveTimetableUpdate() {
  const code = document.getElementById('updateTimetableLabCode')?.value;
  if (!code) return;

  labTimetableMap[code] = currentTimetableTempImage || 'jadual(default).png';
  closeUpdateTimetableModal();

  const ttCodeEl = document.getElementById('labFormTimetableLabCode');
  if (ttCodeEl && document.getElementById('labFormCode')?.value?.trim() === code) {
    const hasCustom = Boolean(labTimetableMap[code]);
    ttCodeEl.textContent = `${code} (${hasCustom ? 'Jadual Kustom' : 'Jadual Rasmi'})`;
  }

  renderManagementLabs();
  showToast('Jadual rasmi bagi ' + code + ' berjaya dikemaskini!');
}

// ─── 14. TIMETABLE VIEWER MODAL ─────────────────────────
function openTimetableModal(code) {
  const lab = labsData.find(l => l.code === code);
  setText('timetableModalTitle', 'Jadual — ' + code);
  if (lab) setText('timetableModalSubtitle', lab.name + ' (' + lab.floor + ')');
  
  const imgEl = document.getElementById('timetableImageDisplay');
  if (imgEl) {
    imgEl.src = labTimetableMap[code] || 'jadual(default).png';
  }

  document.getElementById('timetableModal')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}
function closeTimetableModal() {
  document.getElementById('timetableModal')?.classList.add('hidden');
}

// ─── 15. CUSTOM CONFIRM & ALERT MODAL (NO BROWSER DIALOG) ───
let currentConfirmAction = null;

function showConfirmDialog({ title, message, type = 'confirm', confirmText = 'Sahkan', cancelText = 'Batal', icon = 'help-circle', onConfirm = null }) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const msgEl = document.getElementById('confirmModalMessage');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');
  const iconEl = document.getElementById('confirmModalIcon');
  const iconWrapper = document.getElementById('confirmModalIconWrapper');

  if (!modal) return;
  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.innerHTML = message;
  if (okBtn) {
    okBtn.textContent = confirmText;
    if (type === 'danger') {
      okBtn.className = 'flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all';
    } else {
      okBtn.className = 'flex-1 py-2.5 px-4 text-xs font-bold text-white btn-mesh-gradient rounded-xl shadow-md transition-all';
    }
  }
  if (cancelBtn) {
    cancelBtn.textContent = cancelText;
    cancelBtn.classList.toggle('hidden', type === 'alert');
  }
  if (iconEl) iconEl.setAttribute('data-lucide', icon);
  if (iconWrapper) {
    if (type === 'alert' || type === 'danger') {
      iconWrapper.className = 'w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-sm bg-rose-100 text-rose-700';
    } else {
      iconWrapper.className = 'w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-sm bg-orange-50 text-orange-600';
    }
  }

  currentConfirmAction = onConfirm;
  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function handleConfirmModalAction(confirmed) {
  const modal = document.getElementById('customConfirmModal');
  if (modal) modal.classList.add('hidden');
  if (confirmed && typeof currentConfirmAction === 'function') {
    const cb = currentConfirmAction;
    currentConfirmAction = null;
    cb();
  } else {
    currentConfirmAction = null;
  }
}

// ─── 16. GLOBAL REFRESH (WITH ANIMATION FLAG) ──────────
function refreshAll(animate) {
  renderMetricCards(animate);
  renderUsageTable();
  renderProgressBars();
  renderCompactLabList();
  renderManagementLabs();
  populateTeknikalModalLabs();
  renderTeknikalStats();
  if (window.lucide) window.lucide.createIcons();
}

// ─── 17. TOAST NOTIFICATION ────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toastNotification');
  const m = document.getElementById('toastMessage');
  if (!t || !m) return;
  m.textContent = msg;
  t.classList.remove('translate-y-16','opacity-0');
  t.classList.add('translate-y-0','opacity-100');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('translate-y-0','opacity-100');
    t.classList.add('translate-y-16','opacity-0');
  }, 3000);
}
function showNotificationToast(msg) { showToast(msg); }

// ─── 18. CHATGPT-STYLE PROFILE DROPUP LOGIC ────────────
function toggleProfileDropup(forceState) {
  const dropup = document.getElementById('sidebarProfileDropup');
  if (!dropup) return;
  if (typeof forceState === 'boolean') {
    dropup.classList.toggle('hidden', !forceState);
  } else {
    dropup.classList.toggle('hidden');
  }
  if (!dropup.classList.contains('hidden') && window.lucide) {
    window.lucide.createIcons();
  }
}

function openProfileFromDropup() {
  toggleProfileDropup(false);
  switchNavView('profile');
}

function openSettingsFromDropup() {
  toggleProfileDropup(false);
  document.getElementById('userSettingsModal')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function handleLogoutConfirm() {
  toggleProfileDropup(false);
  showConfirmDialog({
    title: 'Pengesahan Log Keluar',
    message: 'Adakah anda pasti untuk log keluar dari sistem SisTrak Lab?',
    type: 'confirm',
    confirmText: 'Ya, Log Keluar',
    cancelText: 'Batal',
    icon: 'log-out',
    onConfirm: () => {
      showToast('Sesi Pn. Rohana telah didaftar keluar.');
    }
  });
}

// Tutup dropup jika pengguna klik di luar kontena
document.addEventListener('click', (e) => {
  const container = document.getElementById('sidebarProfileContainer');
  const dropup = document.getElementById('sidebarProfileDropup');
  if (dropup && !dropup.classList.contains('hidden')) {
    if (container && !container.contains(e.target)) {
      dropup.classList.add('hidden');
    }
  }
});

