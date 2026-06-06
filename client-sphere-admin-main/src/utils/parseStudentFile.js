const HEADER_MAP = {
  name: ["name", "student name", "full name", "student"],
  email: ["email", "e-mail", "mail", "email address"],
  password: ["password", "pass", "pwd", "temp password"],
  status: ["status", "account status", "active"],
  date: ["date", "joined", "joined date", "join date", "enrollment date", "created"],
};

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
}

function findColumnKey(header) {
  const n = normalizeHeader(header);
  for (const [key, aliases] of Object.entries(HEADER_MAP)) {
    if (aliases.includes(n)) return key;
  }
  return null;
}

function rowToStudent(row, colMap) {
  const get = (key) => {
    const idx = colMap[key];
    if (idx === undefined) return "";
    const val = row[idx];
    if (val === null || val === undefined) return "";
    return String(val).trim();
  };

  return {
    name: get("name"),
    email: get("email"),
    password: get("password"),
    status: get("status"),
    date: get("date"),
  };
}

function parseRows(matrix) {
  if (!matrix?.length) return [];

  const headerRow = matrix[0].map((c) => String(c ?? ""));
  const colMap = {};
  headerRow.forEach((h, i) => {
    const key = findColumnKey(h);
    if (key) colMap[key] = i;
  });

  if (!colMap.name && !colMap.email) {
    colMap.name = 0;
    colMap.email = 1;
    colMap.password = 2;
    colMap.status = 3;
    colMap.date = 4;
  }

  const students = [];
  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.every((c) => c === "" || c == null)) continue;

    const student = rowToStudent(row, colMap);
    if (student.name || student.email) students.push(student);
  }

  return students;
}

/** Parse CSV without xlsx (avoids Vite preload issues for .csv files) */
function parseCSVText(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const matrix = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else {
        cell += ch;
      }
    }
    row.push(cell.trim());
    matrix.push(row);
  }

  return parseRows(matrix);
}

/** Load xlsx only when user imports/downloads Excel (lazy — fixes Vite 504) */
async function loadXLSX() {
  const mod = await import("xlsx");
  return mod.default ?? mod;
}

export async function parseStudentSpreadsheet(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCSVText(text);
  }

  const XLSX = await loadXLSX();
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  return parseRows(matrix);
}

export async function downloadStudentTemplate() {
  const rows = [
    ["name", "email", "password", "status", "date"],
    ["Alex Johnson", "alex.student@example.com", "Student@123", "active", "2024-03-15"],
    ["Priya Patel", "priya.student@example.com", "Student@123", "active", "2024-04-01"],
  ];

  try {
    const XLSX = await loadXLSX();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_import_template.xlsx");
  } catch {
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
}
