// ================= CONFIG =================
const ADMIN_PASSWORD = "0218756209";
const START_WEEK = 6;
const START_DATE = new Date("2026-02-02");

const nationalHolidays = {
  "2026-01-01": { type: "LN", name: "Tahun Baru 2026 Masehi" },
  "2026-01-16": { type: "LN", name: "Isra Mi’raj Nabi Muhammad SAW" },
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

  // Cuti Bersama
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

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  generateWeekOptions();
  const currentWeek = getCurrentWeekNumber();
  document.getElementById("weekSelect").value = currentWeek;
  renderSchedule(currentWeek);
});

// ================= EVENTS =================
document.getElementById("weekSelect").addEventListener("change", e => {
  renderSchedule(parseInt(e.target.value));
});

document.getElementById("adminBtn").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("active");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  isAdmin = false;
  toggleAdminButtons(false);
  renderSchedule(parseInt(document.getElementById("weekSelect").value));
});

document.getElementById("saveBtn").addEventListener("click", saveChanges);
document.getElementById("exportBtn").addEventListener("click", exportToExcel);

// ================= WEEK OPTIONS =================
function generateWeekOptions() {
  const select = document.getElementById("weekSelect");
  for(let i=6;i<=52;i++){
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Week " + i;
    select.appendChild(opt);
  }
}

// ================= RENDER =================
function renderSchedule(weekNumber) {

  firebaseGet(firebaseRef(db, "schedules/week_"+weekNumber))
    .then((snapshot) => {

      const overrides = snapshot.exists() ? snapshot.val() : {};

      const table = document.getElementById("scheduleTable");
      table.innerHTML = "";

      const rotation = (weekNumber - START_WEEK) % 6;

      const monday = new Date(START_DATE);
      monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);

      const days = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

      let header = "<tr><th>No</th><th>NIK</th><th>Nama</th>";

      // ================= CEK HARI LIBUR =================
let holidayInfo = [];

for(let i=0;i<7;i++){
  let d = new Date(monday);
  d.setDate(monday.getDate()+i);

  const iso = formatISO(d);
  let holidayClass = "";

  if(nationalHolidays[iso]){
    const h = nationalHolidays[iso];

    holidayClass = h.type === "LN" ? "holiday-ln" : "holiday-cb";

    holidayInfo.push({
      date: formatDate(d),
      name: h.name,
      type: h.type === "LN" ? "Libur Nasional" : "Cuti Bersama"
    });
  }

  header += `<th class="${holidayClass}">
               ${formatDate(d)}<br>${days[i]}
             </th>`;
}


      header += "</tr>";
      table.innerHTML += header;

      for(let i=0;i<6;i++){

        const staffIndex = (i + rotation) % 6;
        const person = staff[staffIndex];

        let row = `<tr>
          <td>${i+1}</td>
          <td>${person.nik}</td>
          <td>${person.nama}</td>`;

        for(let j=0;j<7;j++){

          let shift = basePattern[i][j];

          if(overrides[i] && overrides[i][j]){
            shift = overrides[i][j];
          }

          row += `<td class="shift-${shift}"
                    onclick="editShift(this)"
                    data-row="${i}"
                    data-col="${j}"
                    data-shift="${shift}">
                    ${shift}
                  </td>`;
        }

        row += "</tr>";
        table.innerHTML += row;
      }
	  
	  // ================= TAMPILKAN INFO LIBUR =================

const oldInfoBox = document.getElementById("holidayInfoBox");
if(oldInfoBox) oldInfoBox.remove();

if(holidayInfo.length > 0){

  const infoBox = document.createElement("div");
  infoBox.id = "holidayInfoBox";
  infoBox.className = "holiday-info-box";

  let html = "<strong>📅 Hari Libur Minggu Ini:</strong><br><br>";

  holidayInfo.forEach(h=>{
    html += `• ${h.date} - ${h.type}<br>   ${h.name}<br><br>`;
  });

  infoBox.innerHTML = html;

  document.querySelector(".table-wrapper").after(infoBox);
}


    });
	
	
}




// ================= EDIT =================
function editShift(cell){
  if(!isAdmin) return;

  const options = ["P","S","M","OFF","C"];
  const current = cell.dataset.shift;
  const nextIndex = (options.indexOf(current)+1)%options.length;
  const newShift = options[nextIndex];

  cell.dataset.shift = newShift;
  cell.textContent = newShift;

  cell.className = "";
  cell.classList.add("shift-" + newShift);
}

// ================= SAVE =================
function saveChanges(){

  const week = document.getElementById("weekSelect").value;
  const cells = document.querySelectorAll("#scheduleTable td[data-row]");

  let data = {};

  cells.forEach(cell=>{
    const row = cell.dataset.row;
    const col = cell.dataset.col;
    const shift = cell.dataset.shift;

    if(!data[row]) data[row] = {};
    data[row][col] = shift;
  });

  localStorage.setItem("week_"+week, JSON.stringify(data));firebaseSet(firebaseRef(db, "schedules/week_"+week), data)
  .then(() => {
    alert("Perubahan disimpan ke Firebase!");
  });
  alert("Perubahan disimpan!");
}



// ================= LOGIN =================
function login(){
  const input = document.getElementById("adminPassword").value;

  if(input === ADMIN_PASSWORD){
    isAdmin = true;
    document.getElementById("loginModal").classList.remove("active");
    toggleAdminButtons(true);
    alert("KA Gudang Aktif");
  } else {
    alert("Password salah");
  }
}

function closeModal(){
  document.getElementById("loginModal").classList.remove("active");
}

function toggleAdminButtons(state){
  document.getElementById("adminBtn").classList.toggle("hidden", state);
  document.getElementById("logoutBtn").classList.toggle("hidden", !state);
  document.getElementById("saveBtn").classList.toggle("hidden", !state);
  document.getElementById("exportBtn").classList.toggle("hidden", !state);
  
}

// ================= FORMAT =================
function formatDate(date){
  const d = String(date.getDate()).padStart(2,'0');
  const m = String(date.getMonth()+1).padStart(2,'0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatISO(date){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function getCurrentWeekNumber(){

  const today = new Date();

  if(today < START_DATE){
    return START_WEEK;
  }

  const diffTime = today - START_DATE;
  const diffDays = Math.floor(diffTime / (1000*60*60*24));
  const diffWeeks = Math.floor(diffDays/7);

  let calculatedWeek = START_WEEK + diffWeeks;
  if(calculatedWeek > 52) calculatedWeek = 52;

  return calculatedWeek;
}

// ================= EXPORT =================
function exportToExcel(){

  const weekNumber = parseInt(document.getElementById("weekSelect").value);
  const rotation = (weekNumber - START_WEEK) % 6;

  const monday = new Date(START_DATE);
  monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);

  const overrides = loadOverrides(weekNumber);
  const days = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

  let data = [];
  let header = ["No","NIK","Nama"];

  for(let i=0;i<7;i++){
    let d = new Date(monday);
    d.setDate(monday.getDate()+i);
    header.push(formatDate(d)+" "+days[i]);
  }

  data.push(header);

  for(let i=0;i<6;i++){
    const staffIndex = (i + rotation) % 6;
    const person = staff[staffIndex];

    let row = [i+1, person.nik, person.nama];

    for(let j=0;j<7;j++){
      let shift = basePattern[i][j];
      if(overrides[i] && overrides[i][j]){
        shift = overrides[i][j];
      }
      row.push(shift);
    }

    data.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  // ================= STYLE WARNA =================
  for(let r=1; r<=6; r++){
    for(let c=3; c<=9; c++){

      const cellRef = XLSX.utils.encode_cell({r:r, c:c});
      const cell = ws[cellRef];
      if(!cell) continue;

      let bgColor = "";

      switch(cell.v){
        case "P": bgColor = "6AA84F"; break;
        case "S": bgColor = "E6B08A"; break;
        case "M": bgColor = "2F5597"; break;
        case "OFF": bgColor = "FF0000"; break;
        case "C": bgColor = "8E44AD"; break;
      }

      cell.s = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: bgColor }
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        },
        font: {
          bold: true,
          color: { rgb: (cell.v==="M" || cell.v==="OFF" || cell.v==="C") ? "FFFFFF" : "000000" }
        }
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Week "+weekNumber);

  XLSX.writeFile(wb, `Jadwal_Week_${weekNumber}.xlsx`, {cellStyles:true});
}

// ================= REALTIME CLOCK =================

function updateClock() {

  const now = new Date();

  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const dayName = hari[now.getDay()];

  const d = String(now.getDate()).padStart(2,'0');
  const m = String(now.getMonth()+1).padStart(2,'0');
  const y = now.getFullYear();

  const h = String(now.getHours()).padStart(2,'0');
  const min = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');

  const formatted = `${dayName} ${d}/${m}/${y} ${h}:${min}:${s} WIB`;

  document.getElementById("liveClock").textContent = formatted;
}

setInterval(updateClock, 1000);
updateClock();

setInterval(() => {
  if (!document.hidden && !isAdmin) {
    const week = parseInt(document.getElementById("weekSelect").value);
    renderSchedule(week);
  }
}, 60000);


/* ================================
   🔁 DETEKSI SHIFT DENGAN TOLERANSI 30 MENIT
================================ */

/* ================================
   🔁 DETEKSI SHIFT DENGAN TOLERANSI (FIXED)
================================ */

function getCurrentShift() {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  // Konversi batas waktu ke total menit
  const limit1 = 7 * 60 + 30;   // 07:30
  const limit2 = 15 * 60 + 30;  // 15:30
  const limit3 = 23 * 60 + 30;  // 23:30

  // Logika Shift 1 (07:31 - 15:30)
  if (minutesNow > limit1 && minutesNow <= limit2) {
    return 1;
  }
  // Logika Shift 2 (15:31 - 23:30)
  else if (minutesNow > limit2 && minutesNow <= limit3) {
    return 2;
  }
  // Logika Shift 3 (23:31 - 07:30)
  else {
    return 3;
  }
}

function getActiveWorkShift(){

  const now = new Date();
  const minutes = now.getHours()*60 + now.getMinutes();

  const s1_start = 7*60+1;
  const s1_end   = 15*60;

  const s2_start = 15*60+1;
  const s2_end   = 23*60;

  const s3_start = 23*60+1;
  const s3_end   = 7*60;

  if(minutes >= s1_start && minutes <= s1_end){
    return 1;
  }

  if(minutes >= s2_start && minutes <= s2_end){
    return 2;
  }

  return 3;

}


// Fungsi untuk memperbarui tampilan BOX SHIFT ACTIVE


// PANGGIL FUNGSI SAAT STARTUP & SET INTERVAL
updateShiftIndicator(); 
setInterval(updateShiftIndicator, 10000); // Cek setiap 10 detik






// ================= THEME TOGGLE =================

const toggleBtn = document.getElementById("themeToggle");

// load tema tersimpan
if(localStorage.getItem("theme") === "formal"){
  document.body.classList.add("formal-theme");
  toggleBtn.textContent = "🌐 Mode Gelap";
}

toggleBtn.addEventListener("click", () => {

  document.body.classList.toggle("formal-theme");

  if(document.body.classList.contains("formal-theme")){
    localStorage.setItem("theme","formal");
    toggleBtn.textContent = "🌐 Mode Gelap";
  } else {
    localStorage.setItem("theme","Gelap");
    toggleBtn.textContent = "🌓 Mode Terang";
  }

});

const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener("click", function () {
  const table = document.getElementById("scheduleTable");

  if (!table) {
    alert("Tabel tidak ditemukan!");
    return;
  }

  const wb = XLSX.utils.table_to_book(table, { sheet: "Jadwal Admin" });
  XLSX.writeFile(wb, "Jadwal_Admin_Gudang.xlsx");
});

function loadSerahTerima(){

  const shiftAktif = getCurrentShift();

  const today = new Date();
  const dateKey = today.toISOString().split("T")[0];

  firebaseGet(firebaseRef(db,"serahTerima/"+dateKey))
  .then(snapshot=>{

    let data = snapshot.exists()?snapshot.val():{};

    let s1 = data.shift1 || "Belum ada catatan";
    let s2 = data.shift2 || "Belum ada catatan";
    let s3 = data.shift3 || "Belum ada catatan";

    const text =

`<span class="ticker-item">
📅 ${dateKey} ◆ SHIFT 3 ➜ ${s3}
</span>

<span class="ticker-item">
◆ SHIFT 1 ➜ ${s1}
</span>

<span class="ticker-item">
◆ SHIFT 2 ➜ ${s2}
</span>`;
    
    const el = document.getElementById("serahTerimaText");
    const clone = document.getElementById("serahTerimaClone");

    if(!el || !clone) return;

    el.innerHTML = text;
    clone.innerHTML = text;

    const track = document.getElementById("newsTrack");

    setTimeout(()=>{

      const width = el.scrollWidth;

      let duration = width / 120;

      if(duration < 15){
        duration = 15;
      }

      track.style.animationDuration = duration + "s";

    },200);

  });

}

function updateShiftIndicator(){

  const shift = getCurrentShift();

  const box = document.getElementById("shiftAktifBox");

  box.className = "shift-box";

  if(shift === 1){
    box.classList.add("shift1-box");
    box.innerText = "SHIFT 1";
  }

  if(shift === 2){
    box.classList.add("shift2-box");
    box.innerText = "SHIFT 2";
  }

  if(shift === 3){
    box.classList.add("shift3-box");
    box.innerText = "SHIFT 3";
  }

}

setInterval(loadSerahTerima, 60000);
loadSerahTerima();

document.getElementById("serahTerimaBtn").addEventListener("click", () => {

  const shift = getCurrentShift();
  const isi = prompt("Masukkan Serah Terima SHIFT " + shift);

  if (!isi) return;

  const today = new Date();
  const dateKey = today.toISOString().split("T")[0];

  function checkDateChange(){

  const now = new Date();
  const newDateKey = now.toISOString().split("T")[0];

  if(newDateKey !== currentDateKey){

    currentDateKey = newDateKey;

    loadSerahTerima(); // reload running text

  }

}
  
  setInterval(checkDateChange, 60000);
  
  firebaseSet(firebaseRef(db, "serahTerima/" + dateKey + "/shift" + shift), isi)
    .then(() => {
      alert("Serah Terima disimpan!");
      loadSerahTerima();
    });

});

document.getElementById("historyBtn").addEventListener("click", () => {

  alert("Fitur History Serah Terima akan menampilkan data beberapa hari terakhir.");

});