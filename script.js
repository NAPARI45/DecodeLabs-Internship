/* ============================================================
   LUNA — CYCLE TRACKER  |  script.js
   All JavaScript logic: data, navigation, calendar, predictions
   ============================================================ */


/* ──────────────────────────────────────────────────────────
   1. DATA MANAGEMENT
   We store all data in localStorage so it survives page refreshes.
   getData() reads from storage, saveData() writes to it.
────────────────────────────────────────────────────────── */

function getData() {
  const stored = localStorage.getItem('luna_data');
  if (stored) {
    return JSON.parse(stored); // parse the saved JSON string back into an object
  }
  // Default structure if nothing is saved yet
  return {
    cycles: [],
    settings: {
      cycleLength: 28,   // average cycle length in days
      periodLength: 5    // average period duration in days
    }
  };
}

function saveData(data) {
  localStorage.setItem('luna_data', JSON.stringify(data));
}


/* ──────────────────────────────────────────────────────────
   2. NAVIGATION
   showSection() hides all pages and shows just the one you want.
   It also updates the active state on all nav buttons.
────────────────────────────────────────────────────────── */

function showSection(sectionId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show the chosen page
  document.getElementById(sectionId).classList.add('active');

  // Update bottom nav buttons
  document.querySelectorAll('.bnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });

  // Update sidebar nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });

  // Refresh the page content when navigating to it
  if (sectionId === 'dashboard') renderDashboard();
  if (sectionId === 'calendar')  renderCalendar();
  if (sectionId === 'history')   renderHistory();
}

// Attach click events to all navigation buttons
document.querySelectorAll('[data-section]').forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.dataset.section));
});


/* ──────────────────────────────────────────────────────────
   3. CYCLE CALCULATIONS
   Helper functions that calculate dates and cycle info.
────────────────────────────────────────────────────────── */

// Returns the most recently logged cycle, or null if none
function getLastCycle() {
  const data = getData();
  if (data.cycles.length === 0) return null;
  return data.cycles[data.cycles.length - 1];
}

// Predicts the start date of the next period
function predictNextPeriod() {
  const data = getData();
  const last = getLastCycle();
  if (!last) return null;

  const lastStart = new Date(last.startDate);
  lastStart.setDate(lastStart.getDate() + data.settings.cycleLength);
  return lastStart;
}

// Predicts ovulation date (typically 14 days before the next period)
function predictOvulation() {
  const nextPeriod = predictNextPeriod();
  if (!nextPeriod) return null;

  const ovulation = new Date(nextPeriod);
  ovulation.setDate(ovulation.getDate() - 14);
  return ovulation;
}

// Returns how many days into the current cycle the user is
function getCurrentCycleDay() {
  const last = getLastCycle();
  if (!last) return null;

  const start = new Date(last.startDate);
  const today = new Date();
  // Floor to whole days, +1 because day 1 is the start date itself
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

// Returns the phase name based on cycle day
function getCurrentPhase() {
  const data = getData();
  const day = getCurrentCycleDay();
  if (!day) return null;

  const pLen = data.settings.periodLength;

  if (day <= pLen)  return 'Menstrual';
  if (day <= 13)    return 'Follicular';
  if (day === 14)   return 'Ovulation';
  if (day <= 28)    return 'Luteal';
  return 'Late Luteal';
}

// Calculates average cycle length across logged cycles
function getAvgCycleLength() {
  const data = getData();
  if (data.cycles.length < 2) return data.settings.cycleLength;

  let total = 0;
  let count = 0;
  for (let i = 1; i < data.cycles.length; i++) {
    const prev = new Date(data.cycles[i - 1].startDate);
    const curr = new Date(data.cycles[i].startDate);
    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    // Only count reasonable lengths (avoids bad data)
    if (diff > 15 && diff < 50) {
      total += diff;
      count++;
    }
  }
  return count > 0 ? Math.round(total / count) : data.settings.cycleLength;
}

// Calculates average period length across logged cycles that have end dates
function getAvgPeriodLength() {
  const data = getData();
  const withEndDate = data.cycles.filter(c => c.endDate);
  if (withEndDate.length === 0) return data.settings.periodLength;

  const total = withEndDate.reduce((sum, c) => {
    const start = new Date(c.startDate);
    const end   = new Date(c.endDate);
    return sum + Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);

  return Math.round(total / withEndDate.length);
}

// Formats a Date object into a human-readable short string (e.g. "15 Jun")
function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Formats a Date into "15 June 2026"
function formatDateLong(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Returns "YYYY-MM-DD" string for a Date object (for comparisons)
function toISODay(date) {
  return date.toISOString().split('T')[0];
}


/* ──────────────────────────────────────────────────────────
   4. DASHBOARD — render cycle day ring, predictions, tip
────────────────────────────────────────────────────────── */

function renderDashboard() {
  // ── Greeting based on time of day ──
  const hour = new Date().getHours();
  const greetingEl = document.getElementById('greeting');
  if (hour < 12)      greetingEl.textContent = 'Good morning 🌸';
  else if (hour < 18) greetingEl.textContent = 'Good afternoon 🌼';
  else                greetingEl.textContent = 'Good evening 🌙';

  const data = getData();
  const day  = getCurrentCycleDay();
  const phase = getCurrentPhase();

  // ── Cycle ring ──
  const ringDayEl  = document.getElementById('ringDay');
  const cycleRingEl = document.getElementById('cycleRing');

  if (day) {
    ringDayEl.textContent = day;
    // Calculate percentage through cycle for the conic-gradient arc
    const pct = Math.min((day / data.settings.cycleLength) * 100, 100);
    cycleRingEl.style.background =
      `conic-gradient(var(--rose) ${pct}%, var(--rose-light) ${pct}%)`;
  } else {
    ringDayEl.textContent = '—';
  }

  // ── Next period prediction ──
  const nextPeriod = predictNextPeriod();
  const nextPeriodEl = document.getElementById('nextPeriodVal');
  if (nextPeriod) {
    const daysUntil = Math.round((nextPeriod - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) {
      nextPeriodEl.textContent = 'Due now';
    } else if (daysUntil === 1) {
      nextPeriodEl.textContent = 'Tomorrow';
    } else {
      nextPeriodEl.textContent = `In ${daysUntil} days`;
    }
  } else {
    nextPeriodEl.textContent = '—';
  }

  // ── Ovulation prediction ──
  const ovulation = predictOvulation();
  const ovEl = document.getElementById('ovulationVal');
  ovEl.textContent = ovulation ? formatDate(ovulation) : '—';

  // ── Current phase ──
  document.getElementById('phaseVal').textContent = phase || '—';

  // ── Phase tips ──
  const tips = {
    'Menstrual':   '🌺 Rest when you can. Your body is working hard — it\'s okay to slow down.',
    'Follicular':  '🌱 Energy is rising! A great time to start new things and get creative.',
    'Ovulation':   '✨ You\'re at your most energetic and social. Embrace it!',
    'Luteal':      '🌙 Wind down gradually and practise self-care this week.',
    'Late Luteal': '🫖 PMS symptoms may appear. Be extra kind to yourself today.'
  };
  const tipEl = document.getElementById('tipCard');
  tipEl.innerHTML = `<p>${tips[phase] || 'Log your first period to start seeing your cycle insights. 🌸'}</p>`;
}


/* ──────────────────────────────────────────────────────────
   5. CALENDAR — renders a month grid with cycle markers
────────────────────────────────────────────────────────── */

// Track which month is currently displayed
let calMonth = new Date().getMonth();
let calYear  = new Date().getFullYear();

function renderCalendar() {
  const data = getData();
  const grid = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('calMonthYear');

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  monthLabel.textContent = `${monthNames[calMonth]} ${calYear}`;
  grid.innerHTML = ''; // clear previous calendar

  // ── Day headers (Su Mo Tu...) ──
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(day => {
    const el = document.createElement('div');
    el.className = 'cal-day-header';
    el.textContent = day;
    grid.appendChild(el);
  });

  // ── Build sets of special dates ──

  // Past period days (from logged cycles)
  const periodDays = new Set();
  data.cycles.forEach(cycle => {
    if (!cycle.startDate) return;
    const start = new Date(cycle.startDate);
    const end   = cycle.endDate
      ? new Date(cycle.endDate)
      : new Date(start.getTime() + (data.settings.periodLength - 1) * 86400000);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      periodDays.add(toISODay(new Date(d)));
    }
  });

  // Predicted future period, fertile window, and ovulation
  const predictedPeriodDays  = new Set();
  const fertileDays          = new Set();
  let   ovulationDay         = null;

  const nextPeriod = predictNextPeriod();
  if (nextPeriod) {
    // Predicted period days
    for (let i = 0; i < data.settings.periodLength; i++) {
      const d = new Date(nextPeriod);
      d.setDate(d.getDate() + i);
      predictedPeriodDays.add(toISODay(d));
    }

    // Ovulation day (14 days before next period)
    const ov = new Date(nextPeriod);
    ov.setDate(ov.getDate() - 14);
    ovulationDay = toISODay(ov);

    // Fertile window: 5 days before ovulation
    for (let i = -5; i < 0; i++) {
      const d = new Date(ov);
      d.setDate(d.getDate() + i);
      fertileDays.add(toISODay(d));
    }
  }

  // ── Empty cells before the 1st of the month ──
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  for (let i = 0; i < firstDayOfMonth; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  // ── Day cells ──
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr    = toISODay(new Date());

  for (let day = 1; day <= daysInMonth; day++) {
    const month  = String(calMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${calYear}-${month}-${dayStr}`;

    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = day;

    // Apply colour classes based on what type of day this is
    if      (periodDays.has(dateStr))          el.classList.add('period-day');
    else if (dateStr === ovulationDay)          el.classList.add('ovulation-day');
    else if (fertileDays.has(dateStr))         el.classList.add('fertile-day');
    else if (predictedPeriodDays.has(dateStr)) el.classList.add('predicted-day');

    // Highlight today
    if (dateStr === todayStr) el.classList.add('today');

    grid.appendChild(el);
  }
}

// Month navigation buttons
document.getElementById('prevMonth').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});


/* ──────────────────────────────────────────────────────────
   6. LOG — handle pill selection and save form
────────────────────────────────────────────────────────── */

// Set default start date to today
document.getElementById('startDate').value = toISODay(new Date());

// Pill button toggle logic — only one pill can be selected per group
document.querySelectorAll('.pill-group').forEach(group => {
  group.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      // Deselect all pills in this group
      group.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
      // Select the clicked pill
      pill.classList.add('selected');
    });
  });
});

// Save log button
document.getElementById('saveLogBtn').addEventListener('click', () => {
  const startDate = document.getElementById('startDate').value;

  // Validation: start date is required
  if (!startDate) {
    showSaveMsg('⚠️ Please enter a start date.', 'error');
    return;
  }

  // Gather all form values
  const endDate = document.getElementById('endDate').value || null;
  const flow    = document.querySelector('#flowGroup .pill.selected')?.dataset.value   || null;
  const cramps  = document.querySelector('#crampsGroup .pill.selected')?.dataset.value || null;
  const mood    = document.querySelector('#moodGroup .pill.selected')?.dataset.value   || null;
  const notes   = document.getElementById('notes').value.trim();

  // Build the cycle entry object
  const entry = { startDate, endDate, flow, cramps, mood, notes };

  // Load existing data, add/update the entry, and save
  const data = getData();
  const existingIndex = data.cycles.findIndex(c => c.startDate === startDate);

  if (existingIndex >= 0) {
    // Update existing entry with same start date
    data.cycles[existingIndex] = entry;
  } else {
    // Add new entry and keep cycles sorted by date
    data.cycles.push(entry);
    data.cycles.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  saveData(data);
  showSaveMsg('✅ Saved! Your cycle has been logged.');

  // Refresh dashboard in background
  renderDashboard();
});

// Helper to display a save confirmation message
function showSaveMsg(msg) {
  const el = document.getElementById('saveMsg');
  el.textContent = msg;
  // Clear the message after 3 seconds
  setTimeout(() => { el.textContent = ''; }, 3000);
}


/* ──────────────────────────────────────────────────────────
   7. HISTORY — render stats and list of past cycles
────────────────────────────────────────────────────────── */

function renderHistory() {
  const data   = getData();
  const cycles = [...data.cycles].reverse(); // most recent first

  // ── Stats ──
  document.getElementById('statCycles').textContent = data.cycles.length;

  // Average cycle length (needs at least 2 cycles to calculate)
  if (data.cycles.length >= 2) {
    document.getElementById('statAvgCycle').textContent = getAvgCycleLength() + 'd';
  } else {
    document.getElementById('statAvgCycle').textContent = '—';
  }

  // Average period length (needs at least 1 cycle with an end date)
  const withEnd = data.cycles.filter(c => c.endDate);
  if (withEnd.length >= 1) {
    document.getElementById('statAvgPeriod').textContent = getAvgPeriodLength() + 'd';
  } else {
    document.getElementById('statAvgPeriod').textContent = '—';
  }

  // ── Cycle list ──
  const listEl = document.getElementById('cycleList');

  if (cycles.length === 0) {
    listEl.innerHTML = '<p class="empty-msg">No cycles logged yet. Head to Log to get started! 🌸</p>';
    return;
  }

  // Build HTML for each cycle entry
  listEl.innerHTML = cycles.map(cycle => {
    const start   = new Date(cycle.startDate);
    const dateStr = formatDateLong(start);

    // Calculate period duration if end date is available
    let durationStr = 'Ongoing';
    if (cycle.endDate) {
      const end  = new Date(cycle.endDate);
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      durationStr = `${days} day period`;
    }

    // Build symptom chips
    let chips = '';
    if (cycle.flow)                        chips += `<span class="chip chip-flow">Flow: ${cycle.flow}</span>`;
    if (cycle.cramps && cycle.cramps !== 'none') chips += `<span class="chip chip-cramps">Cramps: ${cycle.cramps}</span>`;
    if (cycle.mood)                        chips += `<span class="chip chip-mood">${cycle.mood}</span>`;

    // Notes (if any)
    const notesHtml = cycle.notes
      ? `<p class="cycle-notes">"${cycle.notes}"</p>`
      : '';

    return `
      <div class="cycle-entry">
        <div class="cycle-entry-top">
          <span class="cycle-entry-date">🌺 ${dateStr}</span>
          <span class="cycle-entry-dur">${durationStr}</span>
        </div>
        ${chips ? `<div class="chip-row">${chips}</div>` : ''}
        ${notesHtml}
      </div>
    `;
  }).join('');
}


/* ──────────────────────────────────────────────────────────
   8. SETTINGS MODAL
────────────────────────────────────────────────────────── */

// Open modal and pre-fill with saved settings
document.getElementById('settingsBtn').addEventListener('click', () => {
  const data = getData();
  document.getElementById('cycleLen').value  = data.settings.cycleLength;
  document.getElementById('periodLen').value = data.settings.periodLength;
  document.getElementById('settingsModal').classList.add('open');
});

// Close modal
document.getElementById('closeSettings').addEventListener('click', () => {
  document.getElementById('settingsModal').classList.remove('open');
});

// Close modal if user clicks the dark overlay behind it
document.getElementById('settingsModal').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('open');
});

// Save settings
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  const data = getData();
  const newCycleLen  = parseInt(document.getElementById('cycleLen').value);
  const newPeriodLen = parseInt(document.getElementById('periodLen').value);

  // Basic validation
  if (newCycleLen < 20 || newCycleLen > 45) {
    alert('Cycle length must be between 20 and 45 days.');
    return;
  }
  if (newPeriodLen < 2 || newPeriodLen > 10) {
    alert('Period length must be between 2 and 10 days.');
    return;
  }

  data.settings.cycleLength  = newCycleLen;
  data.settings.periodLength = newPeriodLen;
  saveData(data);

  document.getElementById('settingsModal').classList.remove('open');

  // Re-render everything with updated settings
  renderDashboard();
  renderCalendar();
});


/* ──────────────────────────────────────────────────────────
   9. INITIALISE THE APP
   This runs once when the page loads.
────────────────────────────────────────────────────────── */

renderDashboard(); // show dashboard content on load
renderCalendar();  // pre-render calendar in background