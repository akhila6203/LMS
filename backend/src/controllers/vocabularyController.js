const { query } = require("../utils/dbQuery");
const { getUserClassLevel } = require("../utils/progressHelpers");

async function fetchDictionary(word) {
  const encoded = encodeURIComponent(word.trim().toLowerCase());
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encoded}`
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Dictionary API error: ${res.status}`);
  }

  const data = await res.json();
  const entry = data[0];
  if (!entry) return null;

  const meanings = [];
  const relatedWords = new Set();
  let audioUrl = "";

  for (const phonetic of entry.phonetics || []) {
    if (!audioUrl && phonetic.audio) audioUrl = phonetic.audio;
  }

  for (const meaning of entry.meanings || []) {
    const partOfSpeech = meaning.partOfSpeech || "";
    const defs = (meaning.definitions || []).slice(0, 3).map((d) => ({
      definition: d.definition,
      example: d.example || "",
    }));

    if (defs.length) {
      meanings.push({ partOfSpeech, definitions: defs });
    }

    for (const syn of meaning.synonyms || []) {
      if (syn && syn !== word) relatedWords.add(syn);
    }
    for (const ant of meaning.antonyms || []) {
      if (ant && ant !== word) relatedWords.add(ant);
    }
  }

  return {
    word: entry.word,
    phonetic: entry.phonetic || "",
    audioUrl,
    meanings,
    relatedWords: [...relatedWords].slice(0, 12),
  };
}

async function searchLessonMatches(word, classLevel) {
  const term = `%${word.trim()}%`;
  const params = [term, term, term, term];
  let classFilter = "";

  if (classLevel) {
    classFilter = " AND c.class_level = ?";
    params.push(classLevel);
  }

  const rows = await query(
    `SELECT c.id AS course_id, c.title AS lesson_title, c.subject,
            c.class_level, cv.title AS topic_title
     FROM courses c
     LEFT JOIN course_videos cv ON cv.course_id = c.id
     WHERE c.status = 'Active'
       AND (
         c.title LIKE ? OR c.description LIKE ? OR c.subject LIKE ?
         OR cv.title LIKE ?
       )${classFilter}
     ORDER BY c.subject, c.title, cv.sort_order
     LIMIT 30`,
    params
  );

  const grouped = {};
  for (const row of rows) {
    const key = row.course_id;
    if (!grouped[key]) {
      grouped[key] = {
        courseId: row.course_id,
        lessonTitle: row.lesson_title,
        subject: row.subject,
        classLevel: row.class_level,
        topics: [],
      };
    }
    if (row.topic_title && !grouped[key].topics.includes(row.topic_title)) {
      grouped[key].topics.push(row.topic_title);
    }
  }

  return Object.values(grouped);
}

exports.lookupWord = async (req, res) => {
  try {
    const word = String(req.query.word || req.params.word || "").trim();
    if (!word || word.length < 2) {
      return res.status(400).json({ message: "Enter a word to look up" });
    }

    const classLevel = await getUserClassLevel(req.user.id);

    const [dictionary, lessonMatches] = await Promise.all([
      fetchDictionary(word).catch(() => null),
      searchLessonMatches(word, classLevel),
    ]);

    if (!dictionary && !lessonMatches.length) {
      return res.status(404).json({
        message: "No meaning found for this word",
        word,
        lessonMatches: [],
      });
    }

    res.json({
      word,
      dictionary,
      lessonMatches,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to look up word" });
  }
};
