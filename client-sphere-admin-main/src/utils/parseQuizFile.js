const HEADER_MAP = {
  type: ["type", "question type", "qtype", "q type"],
  question: ["question", "q", "prompt", "text", "questions"],
  option1: ["option1", "option 1", "a", "choice1", "choice 1"],
  option2: ["option2", "option 2", "b", "choice2", "choice 2"],
  option3: ["option3", "option 3", "c", "choice3", "choice 3"],
  option4: ["option4", "option 4", "d", "choice4", "choice 4"],
  correct: ["correct", "answer", "correct index", "correct option", "correct answer"],
  correctIndices: [
    "correct indices",
    "correctindices",
    "correct answers",
    "answers",
    "correct options",
  ],
  blankAnswer: [
    "blank answer",
    "blankanswer",
    "blank_answer",
    "blank",
    "fill answer",
    "fill_answer",
    "fill in blank",
  ],
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

function decodeXmlEntities(text) {
  return String(text || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function hasReadableContent(text) {
  return /[\p{L}\p{N}]/u.test(String(text || ""));
}

/** Reject PDF/DOCX binary garbage and corrupted encoding. */
function isReadableText(text) {
  const s = String(text || "").trim();
  if (s.length < 2 || s.length > 8000) return false;
  if (!hasReadableContent(s)) return false;

  const allowed = (
    s.match(/[\p{L}\p{N}\p{M}\s.,?!;:()'"\-_/\\&%+=@#*[\]{}|<>₹°]/gu) || []
  ).length;
  if (allowed / s.length < 0.72) return false;

  if (/[^\p{L}\p{N}\s]{4,}/u.test(s)) return false;

  const latinExtended = (s.match(/[\u0080-\u00FF]/g) || []).length;
  if (latinExtended / s.length > 0.35 && s.length > 24) return false;

  return true;
}

function normalizeType(raw) {
  const val = String(raw || "").trim().toLowerCase();
  if (
    ["checkbox", "multiple", "multi", "multiple choice", "multiple_choice"].includes(
      val
    )
  ) {
    return "checkbox";
  }
  if (
    [
      "fill_blank",
      "fill blank",
      "fill-in-the-blank",
      "fill in the blank",
      "fill in blank",
      "blank",
      "fill",
    ].includes(val)
  ) {
    return "fill_blank";
  }
  if (
    ["radio", "single", "single choice", "single_choice", "mcq", "one"].includes(
      val
    )
  ) {
    return "radio";
  }
  return "radio";
}

function parseCorrectIndex(raw) {
  const val = String(raw || "").trim();
  if (!val) return 0;
  const letter = val.toUpperCase();
  if (letter >= "A" && letter <= "D") return letter.charCodeAt(0) - 65;
  const num = Number(val);
  if (!Number.isNaN(num) && num >= 1 && num <= 4) return num - 1;
  if (!Number.isNaN(num) && num >= 0 && num <= 3) return num;
  return 0;
}

function parseCorrectIndices(raw) {
  const val = String(raw || "").trim();
  if (!val) return [];
  return val
    .split(/[,;|]/)
    .map((part) => parseCorrectIndex(part.trim()))
    .filter((idx, i, arr) => arr.indexOf(idx) === i);
}

function resolveRadioCorrect(correctRaw, options) {
  const val = String(correctRaw || "").trim();
  if (!val) return 0;

  const byIndex = parseCorrectIndex(val);
  if (options[byIndex]?.trim()) return byIndex;

  const lower = val.toLowerCase();
  const textMatch = options.findIndex(
    (o) => o.trim().toLowerCase() === lower
  );
  if (textMatch >= 0) return textMatch;

  return byIndex;
}

function resolveCheckboxCorrect(correctRaw, options) {
  const val = String(correctRaw || "").trim();
  if (!val) return [];

  const parts = val.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
  const indices = [];

  for (const part of parts) {
    const byIndex = parseCorrectIndex(part);
    if (options[byIndex]?.trim() && !indices.includes(byIndex)) {
      indices.push(byIndex);
      continue;
    }
    const lower = part.toLowerCase();
    const textMatch = options.findIndex(
      (o) => o.trim().toLowerCase() === lower
    );
    if (textMatch >= 0 && !indices.includes(textMatch)) {
      indices.push(textMatch);
    }
  }

  return indices.sort((a, b) => a - b);
}

function looksLikeBlankQuestion(text) {
  return /_{2,}|\.{3,}|…|\[\s*\]|\(\s*\)|_{1,}\s*$/.test(String(text || ""));
}

function inferQuestionType(get, q) {
  const explicit = get("type");
  const options = [get("option1"), get("option2"), get("option3"), get("option4")];
  const filledOptions = options.filter(Boolean);
  const blankAnswer = get("blankAnswer");
  const correctRaw = get("correctIndices") || get("correct");

  if (looksLikeBlankQuestion(q)) {
    return "fill_blank";
  }

  if (blankAnswer && filledOptions.length === 0) {
    return "fill_blank";
  }

  if (filledOptions.length >= 2) {
    const indices = resolveCheckboxCorrect(correctRaw, options);
    if (indices.length > 1 || normalizeType(explicit) === "checkbox") {
      return "checkbox";
    }
    return "radio";
  }

  if (blankAnswer) return "fill_blank";

  return normalizeType(explicit || "radio");
}

function rowToQuestion(row, colMap) {
  const get = (key) => {
    const idx = colMap[key];
    if (idx === undefined) return "";
    const val = row[idx];
    if (val === null || val === undefined) return "";
    return String(val).trim();
  };

  const q = get("question");
  if (!q || !isReadableText(q)) return null;

  const type = inferQuestionType(get, q);
  const options = [
    get("option1"),
    get("option2"),
    get("option3"),
    get("option4"),
  ];

  if (type === "fill_blank") {
    const blankAnswer = get("blankAnswer") || get("correct");
    if (!blankAnswer && !looksLikeBlankQuestion(q)) return null;
    if (blankAnswer && !isReadableText(blankAnswer)) return null;
    return {
      type: "fill_blank",
      q,
      blankAnswer: blankAnswer || "",
    };
  }

  const filledOptions = options.filter(Boolean);
  if (filledOptions.length < 2) return null;
  if (!filledOptions.every(isReadableText)) return null;

  if (type === "checkbox") {
    const correctIndices = resolveCheckboxCorrect(
      get("correctIndices") || get("correct"),
      options
    );
    return {
      type: "checkbox",
      q,
      options,
      correctIndices,
    };
  }

  return {
    type: "radio",
    q,
    options,
    correct: resolveRadioCorrect(get("correct"), options),
  };
}

function headerLooksValid(headerRow) {
  const keys = headerRow.map(findColumnKey).filter(Boolean);
  return keys.includes("question");
}

function buildFallbackColMap(headerRow) {
  const colMap = {};
  headerRow.forEach((h, i) => {
    const key = findColumnKey(h);
    if (key) colMap[key] = i;
  });

  if (colMap.question !== undefined) return colMap;

  const sample = headerRow.map((c) => String(c ?? "").trim());
  if (sample.length >= 2 && isReadableText(sample[1])) {
    colMap.type = 0;
    colMap.question = 1;
    colMap.option1 = 2;
    colMap.option2 = 3;
    colMap.option3 = 4;
    colMap.option4 = 5;
    colMap.correct = 6;
    colMap.blankAnswer = 7;
  }

  return colMap;
}

function parseRows(matrix) {
  if (!matrix?.length) return [];

  const headerRow = matrix[0].map((c) => String(c ?? ""));
  const colMap = buildFallbackColMap(headerRow);
  if (colMap.question === undefined) return [];

  const startRow = headerLooksValid(headerRow) ? 1 : 0;
  const questions = [];

  for (let r = startRow; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.every((c) => c === "" || c == null)) continue;
    const question = rowToQuestion(row, colMap);
    if (question) questions.push(question);
  }

  return questions;
}

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

function parseDelimitedText(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const questions = [];
  for (const line of lines) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 2) continue;

    const type = inferQuestionType(
      (key) => {
        const map = {
          type: parts[0],
          question: parts[1],
          option1: parts[2],
          option2: parts[3],
          option3: parts[4],
          option4: parts[5],
          correct: parts[6],
          correctIndices: parts[6],
          blankAnswer: parts[7] || parts[2],
        };
        return map[key] || "";
      },
      parts[1]
    );

    const q = parts[1];
    if (!q || !isReadableText(q)) continue;

    if (type === "fill_blank") {
      const blankAnswer = parts[7] || parts[2] || parts[parts.length - 1] || "";
      if (blankAnswer && !isReadableText(blankAnswer)) continue;
      questions.push({ type: "fill_blank", q, blankAnswer });
      continue;
    }

    const options = [parts[2] || "", parts[3] || "", parts[4] || "", parts[5] || ""];
    if (options.filter(Boolean).length < 2) continue;
    if (!options.filter(Boolean).every(isReadableText)) continue;

    if (type === "checkbox") {
      questions.push({
        type: "checkbox",
        q,
        options,
        correctIndices: resolveCheckboxCorrect(parts[6] || "", options),
      });
      continue;
    }

    questions.push({
      type: "radio",
      q,
      options,
      correct: resolveRadioCorrect(parts[6] || "1", options),
    });
  }

  return questions;
}

function splitTableLine(line) {
  if (line.includes("\t")) {
    return line.split("\t").map((p) => p.trim());
  }
  if (line.includes("|")) {
    return line.split("|").map((p) => p.trim());
  }
  if (line.includes(",")) {
    const row = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else {
        cell += ch;
      }
    }
    row.push(cell.trim());
    return row;
  }
  return line
    .split(/\s{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseTableText(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const matrix = lines.map(splitTableLine);
  const fromRows = parseRows(matrix);
  if (fromRows.length) return fromRows;

  return parseDelimitedText(text);
}

function parseNaturalQuestions(text) {
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const questions = [];
  let current = null;

  const flush = () => {
    if (!current?.q || !isReadableText(current.q)) {
      current = null;
      return;
    }

    if (current.type === "fill_blank") {
      if (current.blankAnswer && isReadableText(current.blankAnswer)) {
        questions.push({
          type: "fill_blank",
          q: current.q,
          blankAnswer: current.blankAnswer,
        });
      } else if (looksLikeBlankQuestion(current.q)) {
        questions.push({
          type: "fill_blank",
          q: current.q,
          blankAnswer: current.blankAnswer || "",
        });
      }
    } else if (current.options.filter(Boolean).length >= 2) {
      const opts = current.options;
      if (!opts.filter(Boolean).every(isReadableText)) {
        current = null;
        return;
      }
      if (current.type === "checkbox") {
        questions.push({
          type: "checkbox",
          q: current.q,
          options: opts,
          correctIndices: current.correctIndices || [],
        });
      } else {
        questions.push({
          type: "radio",
          q: current.q,
          options: opts,
          correct: resolveRadioCorrect(current.correctRaw, opts),
        });
      }
    }

    current = null;
  };

  for (const line of lines) {
    const qMatch = line.match(
      /^(?:Q(?:uestion)?\s*)?(\d+[\).:]|\d+\s*[-–])\s*(.+)$/i
    );
    const qMatch2 = line.match(/^(.+\?)\s*$/);
    const optionMatch = line.match(
      /^([A-Da-d]|[1-4])[\).:\-]\s*(.+)$/
    );
    const answerMatch = line.match(
      /^(?:Answer|Correct(?:\s+answer)?|Ans)\s*[:\-]\s*(.+)$/i
    );
    const fillMatch = line.match(
      /^(?:Fill(?:\s+in(?:\s+the\s+blank)?)?)\s*[:\-]?\s*(.+)$/i
    );

    if (qMatch) {
      flush();
      current = {
        type: "radio",
        q: qMatch[2].trim(),
        options: ["", "", "", ""],
        correctRaw: "",
        correctIndices: [],
      };
      continue;
    }

    if (fillMatch) {
      flush();
      current = {
        type: "fill_blank",
        q: fillMatch[1].trim(),
        blankAnswer: "",
      };
      continue;
    }

    if (!current && qMatch2 && isReadableText(qMatch2[1])) {
      current = {
        type: looksLikeBlankQuestion(qMatch2[1]) ? "fill_blank" : "radio",
        q: qMatch2[1].trim(),
        options: ["", "", "", ""],
        correctRaw: "",
        correctIndices: [],
        blankAnswer: "",
      };
      continue;
    }

    if (!current) continue;

    if (optionMatch && current.type !== "fill_blank") {
      const idx = parseCorrectIndex(optionMatch[1]);
      current.options[idx] = optionMatch[2].trim();
      continue;
    }

    if (answerMatch) {
      const ans = answerMatch[1].trim();
      if (current.type === "fill_blank") {
        current.blankAnswer = ans;
      } else {
        const indices = resolveCheckboxCorrect(ans, current.options);
        if (indices.length > 1) {
          current.type = "checkbox";
          current.correctIndices = indices;
        } else {
          current.correctRaw = ans;
        }
      }
    }
  }

  flush();
  return questions;
}

function parseQuizText(text) {
  const normalized = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const strategies = [
    () => parseCSVText(normalized),
    () => parseTableText(normalized),
    () => parseDelimitedText(normalized),
    () => parseNaturalQuestions(normalized),
  ];

  for (const run of strategies) {
    const questions = run();
    if (questions.length) return questions;
  }

  return [];
}

function readUint32LE(view, offset) {
  return (
    view.getUint8(offset) |
    (view.getUint8(offset + 1) << 8) |
    (view.getUint8(offset + 2) << 16) |
    (view.getUint8(offset + 3) << 24)
  );
}

function findZipEntries(buffer) {
  const view = new DataView(buffer);
  const entries = [];

  for (let i = 0; i < buffer.byteLength - 4; i++) {
    if (view.getUint32(i, true) !== 0x02014b50) continue;

    const compression = view.getUint16(i + 10, true);
    const compressedSize = readUint32LE(view, i + 20);
    const uncompressedSize = readUint32LE(view, i + 24);
    const nameLen = view.getUint16(i + 28, true);
    const extraLen = view.getUint16(i + 30, true);
    const localHeaderOffset = readUint32LE(view, i + 42);
    const nameStart = i + 46;
    const name = new TextDecoder().decode(
      new Uint8Array(buffer, nameStart, nameLen)
    );

    entries.push({
      name,
      compression,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      extraLen,
    });
  }

  return entries;
}

async function decompressZipEntry(buffer, entry) {
  const view = new DataView(buffer);
  const local = entry.localHeaderOffset;
  const nameLen = view.getUint16(local + 26, true);
  const extraLen = view.getUint16(local + 28, true);
  const dataStart = local + 30 + nameLen + extraLen;
  const compressed = new Uint8Array(buffer, dataStart, entry.compressedSize);

  if (entry.compression === 0) {
    return compressed;
  }

  if (entry.compression === 8 && typeof DecompressionStream !== "undefined") {
    const stream = new Blob([compressed])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    const out = await new Response(stream).arrayBuffer();
    return new Uint8Array(out);
  }

  throw new Error("Could not read DOCX content. Save as .docx and try again.");
}

async function getDocxXml(arrayBuffer) {
  const entries = findZipEntries(arrayBuffer);
  const docEntry = entries.find((e) => e.name === "word/document.xml");
  if (!docEntry) {
    throw new Error("Not a valid Word document (.docx).");
  }
  const xmlBytes = await decompressZipEntry(arrayBuffer, docEntry);
  return new TextDecoder("utf-8").decode(xmlBytes);
}

function extractDocxTables(xml) {
  const rows = [];
  const tables = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];

  for (const table of tables) {
    const trs = table.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
    for (const tr of trs) {
      const cells = tr.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
      const row = cells.map((cell) => {
        const texts = [...cell.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(
          (m) => decodeXmlEntities(m[1])
        );
        return texts.join(" ").trim();
      });
      if (row.some((c) => c)) rows.push(row);
    }
  }

  return rows;
}

function extractDocxPlainText(xml) {
  const paragraphs = xml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
  const lines = paragraphs.map((p) => {
    const texts = [...p.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(
      (m) => decodeXmlEntities(m[1])
    );
    return texts.join("").trim();
  });
  return lines.filter(Boolean).join("\n");
}

async function extractDocxContent(arrayBuffer) {
  const xml = await getDocxXml(arrayBuffer);
  const tables = extractDocxTables(xml);
  if (tables.length > 1) {
    const fromTables = parseRows(tables);
    if (fromTables.length) return fromTables;
  }

  const plain = extractDocxPlainText(xml);
  const fromText = parseQuizText(plain);
  if (fromText.length) return fromText;

  return parseNaturalQuestions(plain);
}

function decodePdfLiteralString(raw) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const next = raw[++i];
    if (next === undefined) break;
    if (next >= "0" && next <= "7") {
      let oct = next;
      for (let j = 0; j < 2; j++) {
        const d = raw[i + 1];
        if (d >= "0" && d <= "7") {
          oct += d;
          i++;
        } else break;
      }
      out += String.fromCharCode(parseInt(oct, 8) & 0xff);
      continue;
    }
    if (next === "n") out += "\n";
    else if (next === "r") out += "\r";
    else if (next === "t") out += "\t";
    else if (next === "b") out += "\b";
    else if (next === "f") out += "\f";
    else if (next === "(") out += "(";
    else if (next === ")") out += ")";
    else if (next === "\\") out += "\\";
    else out += next;
  }
  return out;
}

function decodePdfHexString(hex) {
  let clean = hex.replace(/\s/g, "");
  if (!clean) return "";
  if (clean.length % 2) clean += "0";
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes.slice(2));
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

function extractPdfText(arrayBuffer) {
  const raw = new TextDecoder("latin1").decode(arrayBuffer);
  const chunks = [];

  const literalRe = /\(([^()\\]*(?:\\.[^()\\]*)*)\)/g;
  let match;
  while ((match = literalRe.exec(raw))) {
    const text = decodePdfLiteralString(match[1]).trim();
    if (text.length >= 2 && text.length <= 500 && isReadableText(text)) {
      chunks.push(text);
    }
  }

  const hexRe = /<([0-9A-Fa-f\s]{4,})>/g;
  while ((match = hexRe.exec(raw))) {
    const text = decodePdfHexString(match[1]).trim();
    if (text.length >= 2 && text.length <= 500 && isReadableText(text)) {
      chunks.push(text);
    }
  }

  const result = chunks.join("\n");
  if (!result.trim()) {
    throw new Error(
      "Could not read PDF text. Export your quiz to Excel (.xlsx) or CSV and upload that instead."
    );
  }
  return result;
}

async function readFileAsText(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(bytes.slice(3));
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.slice(2));
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes.slice(2));
  }

  try {
    const utf8 = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (hasReadableContent(utf8)) return utf8;
  } catch {
    /* try windows-1252 fallback below */
  }

  try {
    return new TextDecoder("windows-1252").decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

async function loadXLSX() {
  const mod = await import("xlsx");
  return mod.default ?? mod;
}

function sanitizeQuestions(questions) {
  return (questions || []).filter((q) => {
    if (!q?.q || !isReadableText(q.q)) return false;
    if (q.type === "fill_blank") {
      if (q.blankAnswer) return isReadableText(q.blankAnswer);
      return looksLikeBlankQuestion(q.q);
    }
    const opts = (q.options || []).filter(Boolean);
    if (opts.length < 2) return false;
    return opts.every(isReadableText);
  });
}

function validateParsedQuestions(questions, fileLabel) {
  const valid = sanitizeQuestions(questions);
  if (!valid.length) {
    throw new Error(
      `No readable quiz questions found in ${fileLabel}. ` +
        "Use the Excel template: columns type, question, option1–option4, correct (or blank_answer for fill-in-the-blank). " +
        "For PDF/Word files, export to Excel first for best results."
    );
  }
  return valid;
}

export async function parseQuizSpreadsheet(file) {
  const name = file.name.toLowerCase();
  let questions = [];

  if (name.endsWith(".csv")) {
    const text = await readFileAsText(file);
    questions = parseCSVText(text);
    return validateParsedQuestions(questions, "CSV file");
  }

  if (name.endsWith(".txt")) {
    const text = await readFileAsText(file);
    questions = parseQuizText(text);
    return validateParsedQuestions(questions, "text file");
  }

  if (name.endsWith(".pdf")) {
    const buffer = await file.arrayBuffer();
    const text = extractPdfText(buffer);
    questions = parseQuizText(text);
    return validateParsedQuestions(questions, "PDF file");
  }

  if (name.endsWith(".docx")) {
    const buffer = await file.arrayBuffer();
    questions = await extractDocxContent(buffer);
    return validateParsedQuestions(questions, "Word document");
  }

  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files are not supported. Save as .docx, Excel, or CSV and upload again."
    );
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await loadXLSX();
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array", codepage: 65001 });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) {
      throw new Error("Excel file has no worksheets.");
    }
    const matrix = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    questions = parseRows(matrix);
    return validateParsedQuestions(questions, "Excel file");
  }

  throw new Error(
    "Unsupported file format. Upload .xlsx, .xls, .csv, .txt, .pdf, or .docx."
  );
}

export async function downloadQuizTemplate() {
  const rows = [
    [
      "type",
      "question",
      "option1",
      "option2",
      "option3",
      "option4",
      "correct",
      "blank_answer",
    ],
    [
      "radio",
      "What is 2 + 2?",
      "3",
      "4",
      "5",
      "6",
      "2",
      "",
    ],
    [
      "checkbox",
      "Select prime numbers",
      "2",
      "4",
      "5",
      "6",
      "1,3",
      "",
    ],
    [
      "fill_blank",
      "The capital of India is ___",
      "",
      "",
      "",
      "",
      "",
      "New Delhi",
    ],
  ];

  try {
    const XLSX = await loadXLSX();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quiz");
    XLSX.writeFile(wb, "quiz_import_template.xlsx");
  } catch {
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
}
