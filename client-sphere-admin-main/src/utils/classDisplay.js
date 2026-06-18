/** Format "Class 5" → "5th Class" for display */
export function formatClassDisplay(classLevel = "") {
  const val = String(classLevel).trim();
  if (!val) return "Your class";

  const match = val.match(/(\d+)/);
  if (match) {
    const n = Number(match[1]);
    const suffix =
      n % 100 >= 11 && n % 100 <= 13
        ? "th"
        : n % 10 === 1
          ? "st"
          : n % 10 === 2
            ? "nd"
            : n % 10 === 3
              ? "rd"
              : "th";
    return `${n}${suffix} Class`;
  }

  return val;
}

/** Subject tabs from published courses for the learner's class (admin add order) */
export function buildSubjectTabs(courses = []) {
  const seen = new Set();
  const subjects = [];
  for (const c of courses) {
    const s = (c.subCategory || c.subject || "").trim();
    if (s && !seen.has(s)) {
      seen.add(s);
      subjects.push(s);
    }
  }
  return subjects;
}
