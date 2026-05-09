// ================= CONFIG =================
const START_WEEK = 6;
const START_DATE = new Date("2026-02-02");
const START_ROTATION_WEEK = 19;

const nationalHolidays = {
  "2026-01-01": { type: "LN", name: "Tahun Baru 2026 Masehi" },
  "2026-01-16": { type: "LN", name: "Isra Mi'raj Nabi Muhammad SAW" },
  "2026-02-17": { type: "LN", name: "Tahun Baru Imlek 2577 Kongzili" },
  "2026-03-19": { type: "LN", name: "Hari Suci Nyepi (Tahun Baru Saka 1948)" },
  "2026-03-21": { type: "LN", name: "Hari Raya Idul Fitri 1447 H" },
  "2026-03-22": { type: "LN", name: "Hari Raya Idul Fitri 1447 H" },
  "2026-04-03": { type: "LN", name: "Wafat Yesus Kristus / Jumat Agung" },
  "2026-04-05": { type: "LN", name: "Kebangkitan Yesus Kristus (Paskah)" },
  "2026-05-01": { type: "LN", name: "Hari Buruh Internasional" },
  "2026-05-14": { type: "LN", name: "Kenaikan Yesus Kristus" },
  "2026-05-27": { type: "LN", name: "Hari Raya Idul Adha 1447 H" },
  "2026-05-31": { type: "LN", name: "Hari Raya Waisak 2570 BE" },
  "2026-06-01": { type: "LN", name: "Hari Lahir Pancasila" },
  "2026-06-16": { type: "LN", name: "Tahun Baru Islam 1448 H" },
  "2026-08-17": { type: "LN", name: "Hari Kemerdekaan RI" },
  "2026-08-25": { type: "LN", name: "Maulid Nabi Muhammad SAW" },
  "2026-12-25": { type: "LN", name: "Hari Raya Natal" },
  "2026-02-16": { type: "CB", name: "Cuti Bersama Tahun Baru Imlek" },
  "2026-03-18": { type: "CB", name: "Cuti Bersama Nyepi" },
  "2026-03-20": { type: "CB", name: "Cuti Bersama Hari Raya Idul Fitri" },
  "2026-03-23": { type: "CB", name: "Cuti Bersama Hari Raya Idul Fitri" },
  "2026-03-24": { type: "CB", name: "Cuti Bersama Hari Raya Idul Fitri" },
  "2026-05-15": { type: "CB", name: "Cuti Bersama Kenaikan Yesus Kristus" },
  "2026-05-28": { type: "CB", name: "Cuti Bersama Hari Raya Idul Adha" },
  "2026-12-24": { type: "CB", name: "Cuti Bersama Hari Raya Natal" }
};

// ================= DATA STAFF =================
const staff = [
  { nik: "107537", nama: "KAMIL M NUR",   avatar: "KM" },
  { nik: "103356", nama: "BUDIYANSAH",    avatar: "BY" },
  { nik: "105855", nama: "RANDHIKA",      avatar: "RD" },
  { nik: "107271", nama: "RIKI HERMAWAN", avatar: "RH" },
  { nik: "107317", nama: "ACHMAD TAHIR",  avatar: "AT" },
  { nik: "108191", nama: "M DAUD",        avatar: "MD" }
];

const staffOld = [
  { nik: "108191", nama: "M DAUD",        avatar: "MD" },
  { nik: "107271", nama: "RIKI HERMAWAN", avatar: "RH" },
  { nik: "107537", nama: "KAMIL M NUR",   avatar: "KM" },
  { nik: "103356", nama: "BUDIYANSAH",    avatar: "BY" },
  { nik: "105855", nama: "RANDHIKA",      avatar: "RD" },
  { nik: "107317", nama: "ACHMAD TAHIR",  avatar: "AT" }
];

const basePattern = [
  ["P","P","P","OFF","OFF","M","M"],
  ["P","P","OFF","P","P","P","OFF"],
  ["OFF","OFF","P","P","P","P","P"],
  ["S","S","S","OFF","OFF","S","S"],
  ["S","S","S","S","S","OFF","OFF"],
  ["M","M","M","M","M","OFF","OFF"]
];

const kegiatanDefault = [
  { nama: "KAMIL M NUR",    tugas: "Perapihan arsip, Sawang-sawang, Kebersihan lantai area depan" },
  { nama: "BUDIYANSAH",     tugas: "Kebersihan toilet, Lap meja, Buang sampah harian" },
  { nama: "RANDHIKA",       tugas: "Kebersihan area loading, Sapu & pel koridor" },
  { nama: "RIKI HERMAWAN",  tugas: "Perapihan rak gudang, Cek label barang, Kebersihan area storage" },
  { nama: "ACHMAD TAHIR",   tugas: "Kebersihan kantin, Lap kaca, Siram tanaman" },
  { nama: "M DAUD",         tugas: "Kebersihan parkir, Rapikan gerobak, Cek kebocoran atap" }
];

// ================= STATE =================
let isAdmin = false;
let currentDateKey = new Date().toISOString().split("T")[0];
let chatLastCount = 0;
let chatPollingInterval = null;
let isTyping = false;
let typingTimeout = null;
let unreadMessages = 0;
let chatOpen = false;
let replyTo = null;
let currentUserName = null;

// ================= WAIT FOR FIREBASE =================
function waitForFirebase(cb, attempts = 0) {
  if (window.firebaseReady && window.db) {
    cb();
  } else if (attempts > 60) {
    // Setelah 6 detik tetap tidak ready, jalankan saja tanpa Firebase
    console.warn("Firebase tidak merespons, melanjutkan tanpa koneksi.");
    cb();
  } else {
    setTimeout(() => waitForFirebase(cb, attempts + 1), 100);
  }
}

// ================= CLOSE LOADER =================
function closeLoader() {
  const loader = document.getElementById("cyberLoader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => { loader.style.display = "none"; }, 9600);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  generateWeekOptions();
  const currentWeek = getCurrentWeekNumber();
  const sel = document.getElementById("weekSelect");
  if (sel) sel.value = currentWeek;

  waitForFirebase(() => {
setTimeout(() => {
  closeLoader();
}, 85000); // 15 detik // tutup loader begitu Firebase siap
    renderSchedule(currentWeek);
    loadSerahTerima();
    initChat();
    loadKegiatan();
    initPresence();
  });

  setupEvents();
  updateClock();
  setInterval(updateClock, 1000);
  updateShiftIndicator();
  setInterval(updateShiftIndicator, 10000);
  updateShiftCountdown();
  setInterval(updateShiftCountdown, 60000);

  // Auto-refresh schedule
  setInterval(() => {
    if (!document.hidden && !isAdmin) {
      const week = parseInt(document.getElementById("weekSelect").value);
      renderSchedule(week);
    }
  }, 120000);

  setInterval(loadSerahTerima, 60000);
  setInterval(checkDateChange, 60000);

  // Theme restore
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);

  // Init particles after short delay
  setTimeout(initParticles, 300);

  // Loading screen
  setTimeout(() => {
    const loader = document.getElementById("cyberLoader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { loader.style.display = "none"; }, 3800);
    }
  }, 7500);
});

// ================= THEME =================
function applyTheme(theme) {
  const body = document.body;
  const btn = document.getElementById("themeToggle");
  if (theme === "formal") {
    body.classList.add("formal-theme");
    if (btn) btn.innerHTML = '<i class="fas fa-moon"></i> Mode Gelap';
  } else {
    body.classList.remove("formal-theme");
    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i> Mode Terang';
  }
  localStorage.setItem("theme", theme);
}

// ================= SETUP EVENTS =================
function setupEvents() {
  // Week select
  document.getElementById("weekSelect")?.addEventListener("change", e => {
    const w = parseInt(e.target.value);
    renderSchedule(w);
    updateQuickNavLabel(w);
    updateWeekProgress(w);
    setTimeout(updateStatsAfterRender, 600);
  });

  // Admin
  document.getElementById("adminBtn")?.addEventListener("click", () => {
    document.getElementById("loginModal")?.classList.add("active");
    document.getElementById("adminEmail").value = "";
    document.getElementById("adminPassword").value = "";
    document.getElementById("bootText").innerHTML = "";
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (window.signOutFirebase && window.auth) {
      window.signOutFirebase(window.auth).then(() => {
        toggleAdminButtons(false);
        showToast("✅ Logout berhasil");
      }).catch(() => {
        toggleAdminButtons(false);
        showToast("✅ Berhasil keluar");
      });
    } else {
      toggleAdminButtons(false);
      showToast("✅ Berhasil keluar dari mode KA Gudang");
    }
  });

  document.getElementById("saveBtn")?.addEventListener("click", saveChanges);
  document.getElementById("exportBtn")?.addEventListener("click", exportToExcel);
  document.getElementById("printBtn")?.addEventListener("click", () => window.print());

  // Theme toggle
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const isFormal = document.body.classList.contains("formal-theme");
    applyTheme(isFormal ? "dark" : "formal");
  });

  // Serah terima
  document.getElementById("serahTerimaBtn")?.addEventListener("click", openSerahTerimaModal);
  document.getElementById("historyBtn")?.addEventListener("click", openHistoryModal);

  // Chat
  document.getElementById("chatSendBtn")?.addEventListener("click", sendChatMessage);
  document.getElementById("chatInput")?.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
    handleTypingIndicator();
  });

  document.getElementById("chatInput")?.addEventListener("input", handleTypingIndicator);

  document.getElementById("chatToggleBtn")?.addEventListener("click", toggleChat);
  document.getElementById("chatCloseFab")?.addEventListener("click", () => closeChat());

  // Cancel reply
  document.getElementById("cancelReply")?.addEventListener("click", () => {
    replyTo = null;
    const box = document.getElementById("replyPreview");
    if (box) box.style.display = "none";
  });

  // Emoji picker toggle
  document.getElementById("emojiBtn")?.addEventListener("click", toggleEmojiPicker);

  // Kegiatan toggle
  document.getElementById("kegiatanToggleBtn")?.addEventListener("click", () => {
    const body = document.getElementById("kegiatanBody");
    const arrow = document.getElementById("kegiatanArrow");
    body?.classList.toggle("open");
    if (arrow) arrow.textContent = body?.classList.contains("open") ? "▲" : "▼";
  });

  // Quick nav
  document.getElementById("prevWeekBtn")?.addEventListener("click", () => changeWeek(-1));
  document.getElementById("nextWeekBtn")?.addEventListener("click", () => changeWeek(1));

  // Staff search
  document.getElementById("staffSearchInput")?.addEventListener("input", e => {
    applySearchFilter(e.target.value);
  });

  // Scroll to top
  const scrollBtn = document.getElementById("scrollTopBtn");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.classList.toggle("visible", window.scrollY > 300);
    });
    scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Close modals on backdrop click
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.classList.remove("active");
    });
  });

  // Swipe gesture — DINONAKTIFKAN
  // Fitur swipe untuk pindah week dimatikan karena terlalu sensitif
  // dan bentrok dengan scroll tabel horizontal di HP.
  // Gunakan tombol ‹ › atau dropdown weekSelect untuk navigasi week.

  // Keyboard shortcuts
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.active").forEach(m => m.classList.remove("active"));
      if (chatOpen) closeChat();
    }
    if (e.altKey && e.key === "ArrowRight") changeWeek(1);
    if (e.altKey && e.key === "ArrowLeft") changeWeek(-1);
    if (e.altKey && e.key === "c") toggleChat();
  });

  // Ripple effect
  document.addEventListener("click", function(e) {
    const btn = e.target.closest("button, .cyber-link-btn, .mobile-nav-item");
    if (!btn) return;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // MutationObserver for table
  const tbl = document.getElementById("scheduleTable");
  if (tbl) {
    new MutationObserver(() => {
      const wn = parseInt(document.getElementById("weekSelect")?.value || 1);
      setTimeout(() => {
        updateStatsAfterRender();
        highlightTodayColumn(wn);
        addShiftTooltips();
        applySearchFilter(document.getElementById("staffSearchInput")?.value || "");
      }, 50);
    }).observe(tbl, { childList: true, subtree: true });
  }

  // Initial updates
  const w = getCurrentWeekNumber();
  updateQuickNavLabel(w);
  updateWeekProgress(w);
  setTimeout(updateStatsAfterRender, 800);
  initOnlineIndicator();

  // Auth state listener
  if (window.onAuthStateChangedFirebase && window.auth) {
    window.onAuthStateChangedFirebase(window.auth, (user) => {
      if (user) {
        isAdmin = true;
        toggleAdminButtons(true);
        document.body.classList.add("admin-active");
      } else {
        isAdmin = false;
        toggleAdminButtons(false);
        document.body.classList.remove("admin-active");
      }
    });
  }
}

// ================= WEEK NAVIGATION =================
function changeWeek(delta) {
  const sel = document.getElementById("weekSelect");
  if (!sel) return;
  const newVal = parseInt(sel.value) + delta;
  if (newVal >= 6 && newVal <= 52) {
    sel.value = newVal;
    sel.dispatchEvent(new Event("change"));
  }
}

// ================= WEEK OPTIONS =================
function generateWeekOptions() {
  const select = document.getElementById("weekSelect");
  if (!select) return;
  for (let i = 6; i <= 52; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Week " + i;
    select.appendChild(opt);
  }
}

// ================= RENDER SCHEDULE =================
function renderSchedule(weekNumber) {
  if (!window.db) return;

  // Show skeleton
  const table = document.getElementById("scheduleTable");
  if (!table) return;

  window.firebaseGet(window.firebaseRef(window.db, "schedules/week_" + weekNumber))
    .then(snapshot => {
      const overrides = snapshot.exists() ? snapshot.val() : {};
      table.innerHTML = "";

      let rotation;
      if (weekNumber < START_ROTATION_WEEK) rotation = (weekNumber - START_WEEK) % 6;
      else rotation = (weekNumber - START_ROTATION_WEEK) % 6;

      const activeStaff = weekNumber < START_ROTATION_WEEK ? staffOld : staff;
      const monday = new Date(START_DATE);
      monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);
      const days = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

      let header = "<tr><th>No</th><th>NIK</th><th class='nama-col-header'>Nama</th>";
      const holidayInfo = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const iso = formatISO(d);
        let holidayClass = "";
        if (nationalHolidays[iso]) {
          const h = nationalHolidays[iso];
          holidayClass = h.type === "LN" ? "holiday-ln" : "holiday-cb";
          holidayInfo.push({ date: formatDate(d), name: h.name, type: h.type === "LN" ? "Libur Nasional" : "Cuti Bersama" });
        }
        const isToday = formatISO(d) === new Date().toISOString().split("T")[0];
        header += `<th class="${holidayClass}${isToday ? " today-col" : ""}">${formatDate(d)}<br>${days[i]}${isToday ? '<br><span class="today-tag">HARI INI</span>' : ""}</th>`;
      }
      header += "</tr>";
      table.innerHTML += header;

      for (let i = 0; i < 6; i++) {
        const staffIdx = (i + rotation) % 6;
        const person = activeStaff[staffIdx];
        let row = `<tr>
          <td>${i + 1}</td>
          <td class="nik-cell">${person.nik}</td>
          <td class="nama-cell">
            <div class="staff-cell">
              <div class="staff-avatar" data-initial="${person.avatar}">${person.avatar}</div>
              <span>${person.nama}</span>
            </div>
          </td>`;

        for (let j = 0; j < 7; j++) {
          let shift = basePattern[i][j];
          if (overrides[i] && overrides[i][j]) shift = overrides[i][j];
          row += `<td class="shift-${shift}" onclick="editShift(this)" data-row="${i}" data-col="${j}" data-shift="${shift}"><span class="shift-label">${shift}</span></td>`;
        }
        row += "</tr>";
        table.innerHTML += row;
      }

      // Holiday info box
      const old = document.getElementById("holidayInfoBox");
      if (old) old.remove();
      if (holidayInfo.length > 0) {
        const box = document.createElement("div");
        box.id = "holidayInfoBox";
        box.className = "holiday-info-box";
        let html = "<strong>📅 Hari Libur Minggu Ini:</strong><br>";
        holidayInfo.forEach(h => {
          html += `<span class="holiday-item ${h.type === 'Libur Nasional' ? 'ln' : 'cb'}">● ${h.date} — ${h.type}: ${h.name}</span><br>`;
        });
        box.innerHTML = html;
        document.querySelector(".table-wrapper")?.after(box);
      }
    })
    .catch(err => console.error("Firebase error:", err));
}

// ================= EDIT SHIFT =================
function editShift(cell) {
  if (!isAdmin) return;
  const options = ["P","S","M","OFF","C"];
  const current = cell.dataset.shift;
  const next = options[(options.indexOf(current) + 1) % options.length];
  cell.dataset.shift = next;
  cell.className = "shift-" + next;
  cell.innerHTML = `<span class="shift-label">${next}</span>`;
  cell.setAttribute("onclick", "editShift(this)");
  // Visual feedback
  cell.style.transform = "scale(1.15)";
  setTimeout(() => { cell.style.transform = ""; }, 200);
}

// ================= SAVE =================
function saveChanges() {
  const week = document.getElementById("weekSelect").value;
  const cells = document.querySelectorAll("#scheduleTable td[data-row]");
  const data = {};
  cells.forEach(cell => {
    const r = cell.dataset.row;
    const c = cell.dataset.col;
    if (!data[r]) data[r] = {};
    data[r][c] = cell.dataset.shift;
  });

  const btn = document.getElementById("saveBtn");
  if (btn) { btn.disabled = true; btn.textContent = "💾 Menyimpan..."; }

  window.firebaseSet(window.firebaseRef(window.db, "schedules/week_" + week), data)
    .then(() => {
      showToast("💾 Perubahan berhasil disimpan!");
      if (btn) { btn.disabled = false; btn.textContent = "💾 Simpan Perubahan"; }
    })
    .catch(err => {
      showToast("❌ Gagal menyimpan: " + err.message);
      if (btn) { btn.disabled = false; btn.textContent = "💾 Simpan Perubahan"; }
    });
}

// ================= EXPORT =================
function exportToExcel() {
  const weekNumber = parseInt(document.getElementById("weekSelect").value);
  let rotation = weekNumber < START_ROTATION_WEEK ? (weekNumber - START_WEEK) % 6 : (weekNumber - START_ROTATION_WEEK) % 6;
  const activeStaff = weekNumber < START_ROTATION_WEEK ? staffOld : staff;
  const monday = new Date(START_DATE);
  monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);

  const cells = document.querySelectorAll("#scheduleTable td[data-row]");
  const overrides = {};
  cells.forEach(cell => {
    const r = cell.dataset.row, c = cell.dataset.col;
    if (!overrides[r]) overrides[r] = {};
    overrides[r][c] = cell.dataset.shift;
  });

  const days = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
  const data = [["No","NIK","Nama"]];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    data[0].push(formatDate(d) + " " + days[i]);
  }

  for (let i = 0; i < 6; i++) {
    const p = activeStaff[(i + rotation) % 6];
    const row = [i + 1, p.nik, p.nama];
    for (let j = 0; j < 7; j++) {
      row.push((overrides[i] && overrides[i][j]) ? overrides[i][j] : basePattern[i][j]);
    }
    data.push(row);
  }

  if (typeof XLSX === "undefined") { showToast("❌ Library XLSX tidak tersedia"); return; }
  const ws = XLSX.utils.aoa_to_sheet(data);
  const colorMap = { P:"26DE3C", S:"FF9066", M:"5A54B8", OFF:"A60000", C:"FFFF26" };
  for (let r = 1; r <= 6; r++) {
    for (let c = 3; c <= 9; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = ws[ref];
      if (!cell) continue;
      cell.s = {
        fill: { patternType:"solid", fgColor:{ rgb: colorMap[cell.v] || "FFFFFF" } },
        alignment: { horizontal:"center", vertical:"center" },
        font: { bold:true, color:{ rgb:(cell.v==="M"||cell.v==="OFF")?"FFFFFF":"000000" } }
      };
    }
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Week " + weekNumber);
  XLSX.writeFile(wb, `Jadwal_Week_${weekNumber}.xlsx`, { cellStyles:true });
  showToast("📊 Export Excel berhasil!");
}

// ================= LOGIN =================
async function startBiometricScan() {
  const email = document.getElementById("adminEmail")?.value.trim();
  const password = document.getElementById("adminPassword")?.value;
  const boot = document.getElementById("bootText");
  if (!email || !password) { showToast("⚠️ Email dan password wajib diisi"); return; }

  if (boot) boot.innerHTML = "› Connecting Firebase...<br>";
  await delay(400);
  if (boot) boot.innerHTML += "› Verifying administrator...<br>";
  await delay(500);
  if (boot) boot.innerHTML += "› Authenticating secure access...<br>";

  try {
    await window.signInWithEmailAndPassword(window.auth, email, password);
    if (boot) boot.innerHTML += '<span style="color:#00ff88">✔ ACCESS GRANTED</span><br>';
    await delay(700);
    isAdmin = true;
    document.body.classList.add("admin-active");
    document.getElementById("loginModal")?.classList.remove("active");
    toggleAdminButtons(true);
    showToast("✅ Login berhasil sebagai KA Gudang");
  } catch (err) {
    if (boot) boot.innerHTML += '<span style="color:#ff4444">✘ LOGIN FAILED: ' + (err.code || "unknown") + '</span><br>';
    showToast("❌ Email atau password salah");
  }
}

function closeModal() {
  document.getElementById("loginModal")?.classList.remove("active");
}

function toggleAdminButtons(state) {
  isAdmin = state;
  ["adminBtn"].forEach(id => document.getElementById(id)?.classList.toggle("hidden", state));
  ["logoutBtn","saveBtn","exportBtn","printBtn"].forEach(id => document.getElementById(id)?.classList.toggle("hidden", !state));
  document.body.classList.toggle("admin-active", state);
  renderSchedule(parseInt(document.getElementById("weekSelect").value));
}

// ================= FORMAT =================
function formatDate(date) {
  return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
}

function formatISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function getCurrentWeekNumber() {
  const today = new Date();
  if (today < START_DATE) return START_WEEK;
  const diff = Math.floor((today - START_DATE) / 86400000);
  return Math.min(START_WEEK + Math.floor(diff / 7), 52);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ================= CLOCK =================
function updateClock() {
  const now = new Date();
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const pad = n => String(n).padStart(2,"0");
  const el = document.getElementById("liveClock");
  if (el) el.textContent = `${hari[now.getDay()]} ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`;
}

// ================= SHIFT LOGIC =================
function getCurrentShift() {
  const now = new Date();
  const min = now.getHours() * 60 + now.getMinutes();
  if (min > 450 && min <= 930) return 1;   // 07:30 - 15:30
  if (min > 930 && min <= 1410) return 2;  // 15:30 - 23:30
  return 3;                                  // 23:30 - 07:30
}

function updateShiftIndicator() {
  const shift = getCurrentShift();
  const box = document.getElementById("shiftAktifBox");
  if (!box) return;
  box.className = "shift-box shift" + shift + "-box";
  box.innerText = "SHIFT " + shift;
}

function updateShiftCountdown() {
  const el = document.getElementById("shiftCountdown");
  if (!el) return;
  const shift = getCurrentShift();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const endMap = { 1: 930, 2: 1410, 3: 450 };
  let end = endMap[shift];
  let rem = end - nowMin;
  if (rem < 0) rem += 1440;
  if (rem > 1440) rem = 0;
  const h = Math.floor(rem / 60), m = rem % 60;
  el.textContent = rem > 0 ? `⏱ SHIFT ${shift} berakhir dalam ${h}j ${m}m` : "";
}

// ================= SERAH TERIMA =================
function loadSerahTerima() {
  if (!window.db) return;
  const dateKey = new Date().toISOString().split("T")[0];
  window.firebaseGet(window.firebaseRef(window.db, "serahTerima/" + dateKey))
    .then(snapshot => {
      const data = snapshot.exists() ? snapshot.val() : {};
      const s1 = data.shift1 || "Belum ada catatan";
      const s2 = data.shift2 || "Belum ada catatan";
      const s3 = data.shift3 || "Belum ada catatan";
      const text = `<span class="ticker-item">📅 ${dateKey} ◆ SHIFT 3 ➜ ${s3}</span><span class="ticker-item">◆ SHIFT 1 ➜ ${s1}</span><span class="ticker-item">◆ SHIFT 2 ➜ ${s2}</span>`;
      const el = document.getElementById("serahTerimaText");
      const clone = document.getElementById("serahTerimaClone");
      if (el) el.innerHTML = text;
      if (clone) clone.innerHTML = text;
    });
}

function checkDateChange() {
  const newKey = new Date().toISOString().split("T")[0];
  if (newKey !== currentDateKey) { currentDateKey = newKey; loadSerahTerima(); }
}

function openSerahTerimaModal() {
  const shift = getCurrentShift();
  const modal = document.getElementById("serahTerimaModal");
  const label = document.getElementById("serahTerimaShiftLabel");
  const input = document.getElementById("serahTerimaInput");
  if (label) label.textContent = "Input Serah Terima SHIFT " + shift;
  if (input) input.value = "";
  if (modal) modal.classList.add("active");

  // Load existing note
  const dateKey = new Date().toISOString().split("T")[0];
  window.firebaseGet(window.firebaseRef(window.db, "serahTerima/" + dateKey + "/shift" + shift))
    .then(snap => { if (snap.exists() && input) input.value = snap.val(); })
    .catch(() => {});

  document.getElementById("serahTerimaSaveBtn").onclick = () => {
    const isi = input?.value.trim();
    if (!isi) { showToast("⚠️ Catatan tidak boleh kosong!"); return; }
    const btn = document.getElementById("serahTerimaSaveBtn");
    btn.disabled = true; btn.textContent = "Menyimpan...";
    window.firebaseSet(window.firebaseRef(window.db, "serahTerima/" + dateKey + "/shift" + shift), isi)
      .then(() => {
        showToast("✅ Serah Terima Shift " + shift + " disimpan!");
        modal?.classList.remove("active");
        loadSerahTerima();
        btn.disabled = false; btn.textContent = "💾 Simpan";
      });
  };

  document.getElementById("serahTerimaCloseBtn").onclick = () => modal?.classList.remove("active");
}

async function openHistoryModal() {
  if (!window.db) return;
  const modal = document.getElementById("historyModal");
  const content = document.getElementById("historyContent");
  if (content) content.innerHTML = '<div class="loading-pulse">Memuat history...</div>';
  if (modal) modal.classList.add("active");

  try {
    const snapshot = await window.firebaseGet(window.firebaseRef(window.db, "serahTerima"));
    if (!snapshot.exists()) {
      content.innerHTML = "<p style='text-align:center;opacity:0.6;padding:20px'>Belum ada history serah terima.</p>";
    } else {
      const data = snapshot.val();
      let html = "";
      Object.keys(data).sort().slice(-7).reverse().forEach(date => {
        const d = data[date];
        html += `<div class="history-card">
          <div class="history-date">📅 ${date}</div>
          <div class="history-shifts">
            <div class="history-shift shift1-label"><span class="shift-dot s1"></span>SHIFT 1: <span>${d.shift1 || "—"}</span></div>
            <div class="history-shift shift2-label"><span class="shift-dot s2"></span>SHIFT 2: <span>${d.shift2 || "—"}</span></div>
            <div class="history-shift shift3-label"><span class="shift-dot s3"></span>SHIFT 3: <span>${d.shift3 || "—"}</span></div>
          </div>
        </div>`;
      });
      if (content) content.innerHTML = html;
    }
  } catch(e) {
    if (content) content.innerHTML = "<p style='color:red;padding:20px'>Gagal memuat history.</p>";
  }

  document.getElementById("historyCloseBtn").onclick = () => modal?.classList.remove("active");
}

// ================= TOAST =================
function showToast(message, type = "info", duration = 3000) {
  const existing = document.getElementById("toastNotif");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "toastNotif";
  toast.className = `toast-notif toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, duration);
}

// ================= CHAT — ENHANCED =================
function initChat() {
  if (!window.db) return;
  // Get or prompt for username
  currentUserName = localStorage.getItem("chatNama");
  loadChatMessages();
  if (chatPollingInterval) clearInterval(chatPollingInterval);
  chatPollingInterval = setInterval(loadChatMessages, 4000);
}

async function loadChatMessages() {
  if (!window.db) return;
  try {
    const snapshot = await window.firebaseGet(window.firebaseRef(window.db, "chatGlobal"));
    const container = document.getElementById("chatMessages");
    if (!container) return;
    if (!snapshot.exists()) {
      container.innerHTML = '<div class="chat-empty"><i class="fas fa-comments"></i><p>Belum ada pesan. Mulai percakapan!</p></div>';
      return;
    }

    const data = snapshot.val();
    const keys = Object.keys(data).sort();
    const last100 = keys.slice(-100);

    // Check new messages
    if (last100.length > chatLastCount && chatLastCount > 0) {
      if (!chatOpen) {
        unreadMessages = last100.length - chatLastCount;
        updateChatBadge(unreadMessages);
        // Play notification sound
        playNotifSound();
      }
    }
    chatLastCount = last100.length;

    const myName = currentUserName || "User";
    const wasAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 60;

    let html = "";
    let lastDate = "";
    let lastSender = "";

    last100.forEach((key, idx) => {
      const msg = data[key];
      const msgDate = new Date(msg.waktu).toLocaleDateString("id-ID");
      const waktu = new Date(msg.waktu).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
      const isMe = msg.nama === myName;
      const isSame = lastSender === msg.nama && !isMe;

      // Date separator
      if (msgDate !== lastDate) {
        html += `<div class="chat-date-sep"><span>${msgDate === new Date().toLocaleDateString("id-ID") ? "Hari Ini" : msgDate}</span></div>`;
        lastDate = msgDate;
        lastSender = "";
      }

      // Reply preview
      let replyHtml = "";
      if (msg.replyTo) {
        replyHtml = `<div class="chat-reply-preview"><span class="reply-name">${escapeHtml(msg.replyTo.nama)}</span><span class="reply-text">${escapeHtml(msg.replyTo.pesan.substring(0, 60))}</span></div>`;
      }

      // Avatar
      const avatarHtml = !isMe ? `<div class="chat-avatar">${getInitials(msg.nama)}</div>` : "";

      html += `<div class="chat-bubble-wrap ${isMe ? "me" : "other"} ${isSame && !isMe ? "same-sender" : ""}">
        ${!isMe && !isSame ? avatarHtml : (isMe ? "" : '<div class="chat-avatar-placeholder"></div>')}
        <div class="chat-bubble" data-id="${key}" oncontextmenu="showMsgMenu(event,'${key}','${escapeHtml(msg.nama)}','${escapeHtml(msg.pesan)}')">
          ${!isMe && !isSame ? `<div class="chat-sender">${escapeHtml(msg.nama)}</div>` : ""}
          ${replyHtml}
          <div class="chat-text">${formatChatText(escapeHtml(msg.pesan))}</div>
          <div class="chat-meta">
            <span class="chat-time">${waktu}</span>
            ${isMe ? '<span class="chat-status"><i class="fas fa-check-double"></i></span>' : ""}
          </div>
        </div>
      </div>`;
      lastSender = msg.nama;
    });

    container.innerHTML = html;
    if (chatOpen && wasAtBottom) scrollChatToBottom(true);
    if (chatOpen) unreadMessages = 0;
  } catch(e) {
    console.error("Chat load error:", e);
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const pesan = input?.value.trim();
  if (!pesan) return;

  // Ensure username
  if (!currentUserName) {
    currentUserName = prompt("Masukkan nama Anda untuk chat:") || "Anonim";
    localStorage.setItem("chatNama", currentUserName);
  }

  const btn = document.getElementById("chatSendBtn");
  if (btn) { btn.disabled = true; }

  const msgData = {
    nama: currentUserName,
    pesan: pesan,
    waktu: Date.now()
  };

  if (replyTo) {
    msgData.replyTo = { nama: replyTo.nama, pesan: replyTo.pesan };
    replyTo = null;
    const rp = document.getElementById("replyPreview");
    if (rp) rp.style.display = "none";
  }

  const msgId = "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  try {
    await window.firebaseSet(window.firebaseRef(window.db, "chatGlobal/" + msgId), msgData);
    if (input) input.value = "";
    await loadChatMessages();
    scrollChatToBottom(true);
  } catch(e) {
    showToast("❌ Gagal mengirim pesan");
  }
  if (btn) { btn.disabled = false; }
}

function showMsgMenu(e, id, nama, pesan) {
  e.preventDefault();
  const existing = document.getElementById("msgContextMenu");
  if (existing) existing.remove();
  const menu = document.createElement("div");
  menu.id = "msgContextMenu";
  menu.className = "msg-context-menu";
  menu.style.cssText = `left:${Math.min(e.clientX, window.innerWidth - 160)}px;top:${Math.min(e.clientY, window.innerHeight - 120)}px;`;
  menu.innerHTML = `
    <div class="ctx-item" onclick="setReplyTo('${escapeHtml(nama)}','${escapeHtml(pesan)}')"><i class="fas fa-reply"></i> Balas</div>
    <div class="ctx-item" onclick="copyToClipboard('${escapeHtml(pesan)}')"><i class="fas fa-copy"></i> Salin</div>
    ${(nama === currentUserName || isAdmin) ? `<div class="ctx-item danger" onclick="deleteMessage('${id}')"><i class="fas fa-trash"></i> Hapus</div>` : ""}
  `;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener("click", () => menu.remove(), { once: true }), 100);
}

function setReplyTo(nama, pesan) {
  replyTo = { nama, pesan };
  const box = document.getElementById("replyPreview");
  const nameEl = document.getElementById("replyName");
  const textEl = document.getElementById("replyText");
  if (nameEl) nameEl.textContent = nama;
  if (textEl) textEl.textContent = pesan.substring(0, 80);
  if (box) box.style.display = "flex";
  document.getElementById("chatInput")?.focus();
}

async function deleteMessage(id) {
  if (!confirm("Hapus pesan ini?")) return;
  try {
    const { getDatabase, ref, remove } = window._firebaseDB || {};
    // Fallback: use firebaseSet with null
    await window.firebaseSet(window.firebaseRef(window.db, "chatGlobal/" + id), null);
    await loadChatMessages();
    showToast("🗑️ Pesan dihapus");
  } catch(e) {
    showToast("❌ Gagal menghapus pesan");
  }
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => showToast("📋 Disalin!")).catch(() => showToast("❌ Gagal menyalin"));
}

function handleTypingIndicator() {
  if (!window.db || !currentUserName) return;
  clearTimeout(typingTimeout);
  window.firebaseSet(window.firebaseRef(window.db, "typing/" + currentUserName), Date.now());
  typingTimeout = setTimeout(() => {
    window.firebaseSet(window.firebaseRef(window.db, "typing/" + currentUserName), null);
  }, 2500);
}

function toggleChat() {
  chatOpen ? closeChat() : openChat();
}

function openChat() {
  chatOpen = true;
  document.getElementById("chatPanel")?.classList.add("open");
  document.getElementById("chatBadge").style.display = "none";
  unreadMessages = 0;
  updateChatBadge(0);
  setTimeout(() => scrollChatToBottom(true), 100);
  document.getElementById("chatInput")?.focus();
}

function closeChat() {
  chatOpen = false;
  document.getElementById("chatPanel")?.classList.remove("open");
}

function updateChatBadge(count) {
  const badge = document.getElementById("chatBadge");
  if (!badge) return;
  if (count > 0) {
    badge.style.display = "flex";
    badge.textContent = count > 99 ? "99+" : count;
    badge.classList.add("pulse");
  } else {
    badge.style.display = "none";
    badge.classList.remove("pulse");
  }
}

function scrollChatToBottom(smooth = false) {
  const c = document.getElementById("chatMessages");
  if (c) c.scrollTo({ top: c.scrollHeight, behavior: smooth ? "smooth" : "auto" });
}

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

// Emoji picker (simple)
const EMOJIS = ["😀","😂","🙏","👍","👎","❤️","🔥","✅","❌","⚠️","📦","🚛","🧹","💪","🎉","👏","😎","🤔","💡","📝"];
function toggleEmojiPicker() {
  let picker = document.getElementById("emojiPicker");
  if (picker) { picker.remove(); return; }
  picker = document.createElement("div");
  picker.id = "emojiPicker";
  picker.className = "emoji-picker";
  EMOJIS.forEach(em => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn";
    btn.textContent = em;
    btn.onclick = () => {
      const inp = document.getElementById("chatInput");
      if (inp) inp.value += em;
      picker.remove();
      inp?.focus();
    };
    picker.appendChild(btn);
  });
  document.getElementById("chatInputWrap")?.appendChild(picker);
  setTimeout(() => document.addEventListener("click", e => {
    if (!picker.contains(e.target) && e.target.id !== "emojiBtn") picker.remove();
  }, { once: true }), 100);
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatChatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

// ================= PRESENCE / ONLINE =================
function initPresence() {
  if (!window.db || !currentUserName) return;
  const key = currentUserName || "guest_" + Math.random().toString(36).substr(2, 5);
  window.firebaseSet(window.firebaseRef(window.db, "presence/" + key), { online: true, ts: Date.now() });
  window.addEventListener("beforeunload", () => {
    window.firebaseSet(window.firebaseRef(window.db, "presence/" + key), null);
  });
}

function initOnlineIndicator() {
  const el = document.getElementById("onlineCount");
  if (!el) return;
  const update = () => {
    if (window.db) {
      window.firebaseGet(window.firebaseRef(window.db, "presence"))
        .then(snap => {
          if (snap.exists()) {
            const now = Date.now();
            const active = Object.values(snap.val()).filter(v => v.ts && (now - v.ts) < 120000).length;
            el.textContent = Math.max(1, active);
          } else el.textContent = 1;
        }).catch(() => { el.textContent = 1; });
    }
  };
  update();
  setInterval(update, 30000);
}

// ================= KEGIATAN =================
async function loadKegiatan() {
  if (!window.db) return;
  try {
    const snapshot = await window.firebaseGet(window.firebaseRef(window.db, "kegiatan"));
    let data = snapshot.exists() ? snapshot.val() : null;
    if (!data) {
      data = {};
      kegiatanDefault.forEach((k, i) => { data["k_" + i] = { nama: k.nama, tugas: k.tugas }; });
    }
    renderKegiatan(data);
  } catch(e) { renderKegiatan(null); }
}

function renderKegiatan(data) {
  const container = document.getElementById("kegiatanList");
  if (!container) return;
  const items = data ? Object.values(data) : kegiatanDefault;
  container.innerHTML = items.map((item, idx) => {
    const initials = getInitials(item.nama);
    return `<div class="kegiatan-card" id="kCard_${idx}">
      <div class="kegiatan-header">
        <div class="kegiatan-avatar">${initials}</div>
        <span class="kegiatan-nama">${item.nama}</span>
        ${isAdmin ? `<button class="kegiatan-edit-btn" onclick="editKegiatan(${idx},'${item.nama}',\`${item.tugas.replace(/`/g,"'")}\`)">✏️ Edit</button>` : ""}
      </div>
      <div class="kegiatan-tugas"><i class="fas fa-tasks"></i> ${item.tugas}</div>
    </div>`;
  }).join("");
}

function editKegiatan(idx, nama, tugasLama) {
  const modal = document.getElementById("editKegiatanModal");
  const input = document.getElementById("editKegiatanInput");
  const label = document.getElementById("editKegiatanLabel");
  if (label) label.textContent = "Edit tugas: " + nama;
  if (input) input.value = tugasLama;
  if (modal) modal.classList.add("active");

  document.getElementById("editKegiatanSaveBtn").onclick = () => {
    const baru = input?.value.trim();
    if (!baru) { showToast("⚠️ Tugas tidak boleh kosong"); return; }
    window.firebaseSet(window.firebaseRef(window.db, "kegiatan/k_" + idx), { nama, tugas: baru })
      .then(() => { showToast("✅ Tugas berhasil diupdate!"); modal?.classList.remove("active"); loadKegiatan(); })
      .catch(e => showToast("❌ Gagal: " + e.message));
  };
  document.getElementById("editKegiatanCloseBtn").onclick = () => modal?.classList.remove("active");
}

// ================= SCHEDULE FEATURES =================
function updateQuickNavLabel(week) {
  const el = document.getElementById("quickNavLabel");
  if (el) el.textContent = "WEEK " + week;
}

function updateWeekProgress(week) {
  const pct = Math.min(100, Math.round(((week - 6) / 46) * 100));
  const fill = document.getElementById("weekProgressFill");
  const text = document.getElementById("weekProgressText");
  if (fill) fill.style.width = pct + "%";
  if (text) text.textContent = `WEEK ${week} / 52 (${pct}%)`;
}

function updateStatsAfterRender() {
  const cells = document.querySelectorAll("#scheduleTable td[data-shift]");
  const counts = { P:0, S:0, M:0, OFF:0, C:0 };
  cells.forEach(c => { if (counts[c.dataset.shift] !== undefined) counts[c.dataset.shift]++; });
  const ids = { P:"statP", S:"statS", M:"statM", OFF:"statOFF" };
  Object.entries(ids).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = counts[key];
      el.style.transform = "scale(1.3)";
      setTimeout(() => { el.style.transform = ""; el.style.transition = "transform 0.3s"; }, 200);
    }
  });
}

function highlightTodayColumn(weekNumber) {
  const today = new Date();
  const monday = new Date(START_DATE);
  monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d.toDateString() === today.toDateString()) {
      document.querySelectorAll("#scheduleTable tr").forEach(row => {
        const cell = row.cells[3 + i];
        if (cell) cell.classList.add("today-col");
      });
      break;
    }
  }
}

function addShiftTooltips() {
  const hints = { P:"Pagi — 07:30 s/d 15:30", S:"Sore — 15:30 s/d 23:30", M:"Malam — 23:30 s/d 07:30", OFF:"Hari Libur", C:"Cuti" };
  document.querySelectorAll("#scheduleTable td[data-shift]").forEach(cell => {
    const h = hints[cell.dataset.shift];
    if (h) cell.setAttribute("data-hint", h);
  });
}

function applySearchFilter(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll("#scheduleTable tr").forEach((row, idx) => {
    if (idx === 0) return;
    const nama = row.querySelector(".nama-cell")?.textContent.toLowerCase() || "";
    row.style.display = (!q || nama.includes(q)) ? "" : "none";
  });
}

// ================= PARTICLES =================
function initParticles() {
  if (typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: { value: 50, density: { enable: true, value_area: 900 } },
        color: { value: "#00f5ff" },
        shape: { type: "circle" },
        opacity: { value: 0.3, random: true },
        size: { value: 2, random: true },
        line_linked: { enable: true, distance: 130, color: "#00f5ff", opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1.2, direction: "none", random: false, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
        modes: { repulse: { distance: 80 }, push: { particles_nb: 3 } }
      },
      retina_detect: true
    });
  }
}

// ================= MATRIX RAIN =================
(function() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const chars = "01アイウエオカキクケコサシスセソ";
  let drops = Array(Math.floor(w / 16)).fill(1);

  function draw() {
    if (document.body.classList.contains("formal-theme")) return;
    ctx.fillStyle = "rgba(0,4,8,0.05)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(0,245,255,0.35)";
    ctx.font = "13px monospace";
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
      if (y * 16 > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  setInterval(draw, 60);
  window.addEventListener("resize", () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    drops = Array(Math.floor(w / 16)).fill(1);
  });
})();

// ================= SCROLL TO SECTION (mobile nav) =================
function scrollToSection(id) {
  const el = id === "header" ? document.querySelector("header") : document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelectorAll(".mobile-nav-item").forEach(b => b.classList.remove("active"));
  const map = { header: 0, scheduleSection: 1, kegiatanSection: 2 };
  if (map[id] !== undefined) document.querySelectorAll(".mobile-nav-item")[map[id]]?.classList.add("active");
}

function closeFBI() { document.getElementById("fbiLock").style.display = "none"; }
function triggerFBI() { document.getElementById("fbiLock").style.display = "flex"; }