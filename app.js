// ================= CONFIG =================
const ADMIN_PASSWORD = "0218756209";
const START_WEEK = 6;
const START_DATE = new Date("2026-02-02");
const auth = window.auth;

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
  { nik: "108191", nama: "M DAUD" },
  { nik: "107271", nama: "RIKI HERMAWAN" },
  { nik: "107537", nama: "KAMIL M NUR" },
  { nik: "103356", nama: "BUDIYANSAH" },
  { nik: "105855", nama: "RANDHIKA" },
  { nik: "107317", nama: "ACHMAD TAHIR" }
];

// ================= POLA SHIFT =================
const basePattern = [
  ["P","P","P","OFF","OFF","M","M"],
  ["P","P","OFF","P","P","P","OFF"],
  ["OFF","OFF","P","P","P","P","P"],
  ["S","S","S","OFF","OFF","S","S"],
  ["S","S","S","S","S","OFF","OFF"],
  ["M","M","M","M","M","OFF","OFF"]
];

let isAdmin = false;
let failedAttempts = 0; // single declaration — BUG FIX
let currentDateKey = new Date().toISOString().split("T")[0];

// ================= WAIT FOR FIREBASE =================
function waitForFirebase(cb) {
  if (window.firebaseReady && window.db) {
    cb();
  } else {
    setTimeout(() => waitForFirebase(cb), 100);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  generateWeekOptions();
  const currentWeek = getCurrentWeekNumber();
  document.getElementById("weekSelect").value = currentWeek;

  // Wait for firebase before rendering
  waitForFirebase(() => {
    renderSchedule(currentWeek);
    loadSerahTerima();
  });

  setupEvents();
  updateClock();
  setInterval(updateClock, 1000);
  updateShiftIndicator();
  setInterval(updateShiftIndicator, 10000);

  // Auto-refresh schedule every 60s (only when not admin)
  setInterval(() => {
    if (!document.hidden && !isAdmin) {
      const week = parseInt(document.getElementById("weekSelect").value);
      renderSchedule(week);
    }
  }, 60000);

  // Serah terima auto-refresh
  setInterval(loadSerahTerima, 60000);
  setInterval(checkDateChange, 60000);

  // Theme restore
  const toggleBtn = document.getElementById("themeToggle");
  if (localStorage.getItem("theme") === "formal") {
    document.body.classList.add("formal-theme");
    toggleBtn.textContent = "🌐 Mode Gelap";
  }
});

// ================= SETUP EVENTS (single place, no duplicates) =================
function setupEvents() {
  document.getElementById("weekSelect").addEventListener("change", e => {
    renderSchedule(parseInt(e.target.value));
  });

  document.getElementById("adminBtn").addEventListener("click", () => {
	  
    document.getElementById("loginModal").classList.add("active");
	document.getElementById("adminEmail").value = "";
    document.getElementById("adminPassword").value = "";
    document.getElementById("bootText").innerHTML = "";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOutFirebase(auth).then(() => {

  toggleAdminButtons(false);

  showToast("✅ Logout berhasil");

});
    toggleAdminButtons(false);
    renderSchedule(parseInt(document.getElementById("weekSelect").value));
    showToast("✅ Berhasil keluar dari mode KA Gudang");
  });

  document.getElementById("saveBtn").addEventListener("click", saveChanges);
  document.getElementById("exportBtn").addEventListener("click", exportToExcel);

  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("formal-theme");
    const btn = document.getElementById("themeToggle");
    if (document.body.classList.contains("formal-theme")) {
      localStorage.setItem("theme", "formal");
      btn.textContent = "🌐 Mode Gelap";
    } else {
      localStorage.setItem("theme", "Gelap");
      btn.textContent = "🌓 Mode Terang";
    }
  });

  document.getElementById("serahTerimaBtn").addEventListener("click", openSerahTerimaModal);
  document.getElementById("historyBtn").addEventListener("click", openHistoryModal);
}

// ================= WEEK OPTIONS =================
function generateWeekOptions() {
  const select = document.getElementById("weekSelect");
  for (let i = 6; i <= 52; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Week " + i;
    select.appendChild(opt);
  }
}

// ================= RENDER =================
function renderSchedule(weekNumber) {
  if (!window.db) return;

  firebaseGet(firebaseRef(db, "schedules/week_" + weekNumber))
    .then((snapshot) => {
      const overrides = snapshot.exists() ? snapshot.val() : {};
      const table = document.getElementById("scheduleTable");
      table.innerHTML = "";

      const rotation = (weekNumber - START_WEEK) % 6;
      const monday = new Date(START_DATE);
      monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);

      const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

      let header = "<tr><th>No</th><th>NIK</th><th>Nama</th>";
      let holidayInfo = [];

      for (let i = 0; i < 7; i++) {
        let d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const iso = formatISO(d);
        let holidayClass = "";

        if (nationalHolidays[iso]) {
          const h = nationalHolidays[iso];
          holidayClass = h.type === "LN" ? "holiday-ln" : "holiday-cb";
          holidayInfo.push({
            date: formatDate(d),
            name: h.name,
            type: h.type === "LN" ? "Libur Nasional" : "Cuti Bersama"
          });
        }

        header += `<th class="${holidayClass}">${formatDate(d)}<br>${days[i]}</th>`;
      }

      header += "</tr>";
      table.innerHTML += header;

      for (let i = 0; i < 6; i++) {
        const staffIndex = (i + rotation) % 6;
        const person = staff[staffIndex];

        let row = `<tr>
          <td>${i + 1}</td>
          <td>${person.nik}</td>
          <td class="nama-cell">${person.nama}</td>`;

        for (let j = 0; j < 7; j++) {
          let shift = basePattern[i][j];
          if (overrides[i] && overrides[i][j]) {
            shift = overrides[i][j];
          }

          row += `<td class="shift-${shift}" onclick="editShift(this)" data-row="${i}" data-col="${j}" data-shift="${shift}">${shift}</td>`;
        }

        row += "</tr>";
        table.innerHTML += row;
      }

      // Holiday info box
      const oldInfoBox = document.getElementById("holidayInfoBox");
      if (oldInfoBox) oldInfoBox.remove();

      if (holidayInfo.length > 0) {
        const infoBox = document.createElement("div");
        infoBox.id = "holidayInfoBox";
        infoBox.className = "holiday-info-box";

        let html = "<strong>📅 Hari Libur Minggu Ini:</strong><br>";
        holidayInfo.forEach(h => {
          html += `<span class="holiday-item ${h.type === 'Libur Nasional' ? 'ln' : 'cb'}">● ${h.date} — ${h.type}: ${h.name}</span><br>`;
        });

        infoBox.innerHTML = html;
        document.querySelector(".table-wrapper").after(infoBox);
      }
    })
    .catch(err => {
      console.error("Firebase error:", err);
    });
}

// ================= EDIT SHIFT =================
function editShift(cell) {
  if (!isAdmin) return;
  const options = ["P", "S", "M", "OFF", "C"];
  const current = cell.dataset.shift;
  const nextIndex = (options.indexOf(current) + 1) % options.length;
  const newShift = options[nextIndex];

  cell.dataset.shift = newShift;
  cell.textContent = newShift;
  cell.className = "shift-" + newShift;
  cell.setAttribute("onclick", "editShift(this)");
  cell.setAttribute("data-row", cell.dataset.row);
  cell.setAttribute("data-col", cell.dataset.col);
}

// ================= SAVE =================
function saveChanges() {
  const week = document.getElementById("weekSelect").value;
  const cells = document.querySelectorAll("#scheduleTable td[data-row]");

  let data = {};
  cells.forEach(cell => {
    const row = cell.dataset.row;
    const col = cell.dataset.col;
    const shift = cell.dataset.shift;
    if (!data[row]) data[row] = {};
    data[row][col] = shift;
  });

  // BUG FIX: single save flow, no double alert
  firebaseSet(firebaseRef(db, "schedules/week_" + week), data)
    .then(() => {
      showToast("💾 Perubahan berhasil disimpan ke Firebase!");
    })
    .catch(err => {
      showToast("❌ Gagal menyimpan: " + err.message);
    });
}

// ================= EXPORT (BUG FIX: removed undefined loadOverrides call) =================
function exportToExcel() {
  const weekNumber = parseInt(document.getElementById("weekSelect").value);
  const rotation = (weekNumber - START_WEEK) % 6;

  const monday = new Date(START_DATE);
  monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);

  // Read overrides from current table cells (not from undefined function)
  const cells = document.querySelectorAll("#scheduleTable td[data-row]");
  let overrides = {};
  cells.forEach(cell => {
    const r = cell.dataset.row;
    const c = cell.dataset.col;
    const s = cell.dataset.shift;
    if (!overrides[r]) overrides[r] = {};
    overrides[r][c] = s;
  });

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  let data = [];
  let header = ["No", "NIK", "Nama"];

  for (let i = 0; i < 7; i++) {
    let d = new Date(monday);
    d.setDate(monday.getDate() + i);
    header.push(formatDate(d) + " " + days[i]);
  }

  data.push(header);

  for (let i = 0; i < 6; i++) {
    const staffIndex = (i + rotation) % 6;
    const person = staff[staffIndex];
    let row = [i + 1, person.nik, person.nama];

    for (let j = 0; j < 7; j++) {
      let shift = basePattern[i][j];
      if (overrides[i] && overrides[i][j]) {
        shift = overrides[i][j];
      }
      row.push(shift);
    }

    data.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  for (let r = 1; r <= 6; r++) {
    for (let c = 3; c <= 9; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell) continue;

      let bgColor = "";
      switch (cell.v) {
        case "P":   bgColor = "26DE3C"; break;
        case "S":   bgColor = "FF9066"; break;
        case "M":   bgColor = "5A54B8"; break;
        case "OFF": bgColor = "A60000"; break;
        case "C":   bgColor = "FFFF26"; break;
      }

      cell.s = {
        fill: { patternType: "solid", fgColor: { rgb: bgColor } },
        alignment: { horizontal: "center", vertical: "center" },
        font: {
          bold: true,
          color: { rgb: (cell.v === "M" || cell.v === "OFF") ? "FFFFFF" : "000000" }
        }
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Week " + weekNumber);
  XLSX.writeFile(wb, `Jadwal_Week_${weekNumber}.xlsx`, { cellStyles: true });
  showToast("📊 Export Excel berhasil!");
}

// ================= LOGIN =================
async function startBiometricScan() {

  const email =
    document.getElementById("adminEmail").value.trim();

  const password =
    document.getElementById("adminPassword").value;

  const boot =
    document.getElementById("bootText");

  if (!email || !password) {
    showToast("⚠️ Email dan password wajib diisi");
    return;
  }

  boot.innerHTML =
    "› Connecting Firebase...<br>";

  setTimeout(() => {
    boot.innerHTML +=
      "› Verifying administrator...<br>";
  }, 500);

  setTimeout(() => {
    boot.innerHTML +=
      "› Authenticating secure access...<br>";
  }, 1000);

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    boot.innerHTML +=
      '<span style="color:#00ff88">✔ ACCESS GRANTED</span><br>';

    setTimeout(() => {

      isAdmin = true;

      document.body.classList.add("admin-active");

      document.getElementById("loginModal")
        .classList.remove("active");

      toggleAdminButtons(true);

      showToast("✅ Login berhasil");

    }, 700);

  } catch(err) {

    console.error(err);

    boot.innerHTML +=
      '<span style="color:#ff4444">✘ LOGIN FAILED</span><br>';

    showToast("❌ Email atau password salah");

  }
}

onAuthStateChanged(auth, (user) => {

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

function closeModal() {
  document.getElementById("loginModal")
    .classList.remove("active");
}

function toggleAdminButtons(state) {

  isAdmin = state;

  document.getElementById("adminBtn")
    .classList.toggle("hidden", state);

  document.getElementById("logoutBtn")
    .classList.toggle("hidden", !state);

  document.getElementById("saveBtn")
    .classList.toggle("hidden", !state);

  document.getElementById("exportBtn")
    .classList.toggle("hidden", !state);

  // tombol edit aktif
  document.body.classList.toggle(
    "admin-active",
    state
  );

  // refresh tabel
  renderSchedule(
    parseInt(document.getElementById("weekSelect").value)
  );
}

function triggerFBI() {
  document.getElementById("fbiLock").style.display = "flex";
}

function closeFBI() {
  document.getElementById("fbiLock").style.display = "none";
}

// ================= SPEAK =================
function speak(text) {
  if (!window.speechSynthesis) return;
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

// ================= FORMAT =================
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCurrentWeekNumber() {
  const today = new Date();
  if (today < START_DATE) return START_WEEK;
  const diffDays = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
  let calculatedWeek = START_WEEK + Math.floor(diffDays / 7);
  if (calculatedWeek > 52) calculatedWeek = 52;
  return calculatedWeek;
}

// ================= CLOCK =================
function updateClock() {
  const now = new Date();
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const el = document.getElementById("liveClock");
  if (el) el.textContent = `${hari[now.getDay()]} ${d}/${m}/${y} ${h}:${min}:${s} WIB`;
}

// ================= SHIFT LOGIC =================
function getCurrentShift() {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  if (minutesNow > 7 * 60 + 30 && minutesNow <= 15 * 60 + 30) return 1;
  if (minutesNow > 15 * 60 + 30 && minutesNow <= 23 * 60 + 30) return 2;
  return 3;
}

function updateShiftIndicator() {
  const shift = getCurrentShift();
  const box = document.getElementById("shiftAktifBox");
  if (!box) return;

  box.className = "shift-box";
  const labels = { 1: "SHIFT 1", 2: "SHIFT 2", 3: "SHIFT 3" };
  const classes = { 1: "shift1-box", 2: "shift2-box", 3: "shift3-box" };

  box.classList.add(classes[shift]);
  box.innerText = labels[shift];
}

// ================= SERAH TERIMA =================
function loadSerahTerima() {
  if (!window.db) return;
  const today = new Date();
  const dateKey = today.toISOString().split("T")[0];

  firebaseGet(firebaseRef(db, "serahTerima/" + dateKey))
    .then(snapshot => {
      let data = snapshot.exists() ? snapshot.val() : {};
      let s1 = data.shift1 || "Belum ada catatan";
      let s2 = data.shift2 || "Belum ada catatan";
      let s3 = data.shift3 || "Belum ada catatan";

      const text = `<span class="ticker-item">📅 ${dateKey} ◆ SHIFT 3 ➜ ${s3}</span><span class="ticker-item">◆ SHIFT 1 ➜ ${s1}</span><span class="ticker-item">◆ SHIFT 2 ➜ ${s2}</span>`;

      const el = document.getElementById("serahTerimaText");
      const clone = document.getElementById("serahTerimaClone");
      if (!el || !clone) return;

      el.innerHTML = text;
      clone.innerHTML = text;

      const track = document.getElementById("newsTrack");
      if (track) {
        track.style.animation = "none";
        void track.offsetHeight;
        track.style.animation = null;

        setTimeout(() => {
          const width = el.scrollWidth;
          let duration = Math.max(15, width / 120);
          track.style.animationDuration = duration + "s";
        }, 200);
      }
    });
}

function checkDateChange() {
  const newDateKey = new Date().toISOString().split("T")[0];
  if (newDateKey !== currentDateKey) {
    currentDateKey = newDateKey;
    loadSerahTerima();
  }
}

// ================= SERAH TERIMA MODAL (replaces prompt()) =================
function openSerahTerimaModal() {
  const shift = getCurrentShift();
  const modal = document.getElementById("serahTerimaModal");
  document.getElementById("serahTerimaShiftLabel").textContent = "Input Serah Terima SHIFT " + shift;
  document.getElementById("serahTerimaInput").value = "";
  modal.classList.add("active");

  document.getElementById("serahTerimaSaveBtn").onclick = () => {
    const isi = document.getElementById("serahTerimaInput").value.trim();
    if (!isi) { showToast("⚠️ Catatan tidak boleh kosong!"); return; }

    const dateKey = new Date().toISOString().split("T")[0];
    firebaseSet(firebaseRef(db, "serahTerima/" + dateKey + "/shift" + shift), isi)
      .then(() => {
        showToast("✅ Serah Terima Shift " + shift + " disimpan!");
        modal.classList.remove("active");
        loadSerahTerima();
      });
  };

  document.getElementById("serahTerimaCloseBtn").onclick = () => {
    modal.classList.remove("active");
  };
}

// ================= HISTORY MODAL (replaces alert()) =================
async function openHistoryModal() {
  if (!window.db) return;
  const snapshot = await firebaseGet(firebaseRef(db, "serahTerima"));
  const modal = document.getElementById("historyModal");
  const content = document.getElementById("historyContent");

  if (!snapshot.exists()) {
    content.innerHTML = "<p style='text-align:center;opacity:0.6'>Belum ada history serah terima.</p>";
  } else {
    const data = snapshot.val();
    let html = "";
    Object.keys(data).sort().slice(-7).reverse().forEach(date => {
      const d = data[date];
      html += `
        <div class="history-card">
          <div class="history-date">📅 ${date}</div>
          <div class="history-shifts">
            <div class="history-shift shift1-label">SHIFT 1: <span>${d.shift1 || "—"}</span></div>
            <div class="history-shift shift2-label">SHIFT 2: <span>${d.shift2 || "—"}</span></div>
            <div class="history-shift shift3-label">SHIFT 3: <span>${d.shift3 || "—"}</span></div>
          </div>
        </div>`;
    });
    content.innerHTML = html;
  }

  modal.classList.add("active");
  document.getElementById("historyCloseBtn").onclick = () => {
    modal.classList.remove("active");
  };
}

// ================= TOAST NOTIFICATION (replaces all alert()) =================
function showToast(message) {
  const existing = document.getElementById("toastNotif");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toastNotif";
  toast.className = "toast-notif";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

