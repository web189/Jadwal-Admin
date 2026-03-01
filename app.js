// ================= CONFIG =================
const ADMIN_PASSWORD = "admin123";
const START_WEEK = 6;
const START_DATE = new Date("2026-02-02");

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

  const table = document.getElementById("scheduleTable");
  table.innerHTML = "";

  const rotation = (weekNumber - START_WEEK) % 6;

  const monday = new Date(START_DATE);
  monday.setDate(START_DATE.getDate() + (weekNumber - START_WEEK) * 7);

  const days = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

  let header = "<tr><th>No</th><th>NIK</th><th>Nama</th>";
  for(let i=0;i<7;i++){
    let d = new Date(monday);
    d.setDate(monday.getDate()+i);
    header += `<th>${formatDate(d)}<br>${days[i]}</th>`;
  }
  header += "</tr>";
  table.innerHTML += header;

  const overrides = loadOverrides(weekNumber);

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

  localStorage.setItem("week_"+week, JSON.stringify(data));
  alert("Perubahan disimpan!");
}

// ================= LOAD =================
function loadOverrides(week){
  const data = localStorage.getItem("week_"+week);
  return data ? JSON.parse(data) : {};
}

// ================= LOGIN =================
function login(){
  const input = document.getElementById("adminPassword").value;

  if(input === ADMIN_PASSWORD){
    isAdmin = true;
    document.getElementById("loginModal").classList.remove("active");
    toggleAdminButtons(true);
    alert("Mode Admin Aktif");
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
