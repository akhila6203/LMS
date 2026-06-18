import { useEffect, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import QuizImportModal from "./QuizImportModal";

const QUESTION_TYPES = [
  { id: "radio", label: "Single choice (Radio)" },
  { id: "checkbox", label: "Multiple choice (Checkbox)" },
  { id: "fill_blank", label: "Fill in the blank" },
];

const createQuestion = (type = "radio") => {
  if (type === "checkbox") {
    return { type: "checkbox", q: "", options: ["", "", "", ""], correctIndices: [] };
  }
  if (type === "fill_blank") {
    return { type: "fill_blank", q: "", blankAnswer: "" };
  }
  return { type: "radio", q: "", options: ["", "", "", ""], correct: 0 };
};

const normalizeQuestion = (q) => {
  const type = q.type || "radio";
  if (type === "checkbox") {
    return {
      type: "checkbox",
      q: q.q || "",
      options: q.options?.length ? q.options : ["", "", "", ""],
      correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [],
    };
  }
  if (type === "fill_blank") {
    return {
      type: "fill_blank",
      q: q.q || "",
      blankAnswer: q.blankAnswer || "",
    };
  }
  return {
    type: "radio",
    q: q.q || "",
    options: q.options?.length ? q.options : ["", "", "", ""],
    correct: typeof q.correct === "number" ? q.correct : 0,
  };
};

export default function Step4({ onNext, data, setStep, isModal = false, isEdit = false }) {
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([createQuestion("radio")]);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (data?.questions?.length) {
      setQuestions(data.questions.map(normalizeQuestion));
    } else if (data?.quizzes?.[0]?.questions?.length) {
      setQuestions(data.quizzes[0].questions.map(normalizeQuestion));
    } else {
      setQuestions([createQuestion("radio")]);
    }

    if (data?.quizTitle) {
      setQuizTitle(data.quizTitle);
    } else if (data?.quizzes?.[0]?.quizTitle) {
      setQuizTitle(data.quizzes[0].quizTitle);
    }
  }, [data]);

  const addQuestion = (type) => {
    setQuestions((prev) => [...prev, createQuestion(type)]);
  };

  const deleteQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const toggleCheckboxCorrect = (qIndex, optIndex) => {
    const q = questions[qIndex];
    const current = q.correctIndices || [];
    const next = current.includes(optIndex)
      ? current.filter((i) => i !== optIndex)
      : [...current, optIndex].sort();
    updateQuestion(qIndex, { correctIndices: next });
  };

  const buildPayload = () => ({
    quizzes: [
      {
        quizTitle,
        questions,
        attempts: data?.attempts ?? 0,
        passRate: data?.passRate ?? 0,
      },
    ],
  });

  const typeLabel = (type) =>
    QUESTION_TYPES.find((t) => t.id === type)?.label || "Question";

  const handleImportQuestions = (imported) => {
    const normalized = imported.map(normalizeQuestion);
    setQuestions((prev) => {
      const isEmptyStarter =
        prev.length === 1 && !prev[0].q?.trim() && prev[0].type === "radio";
      return isEmptyStarter ? normalized : [...prev, ...normalized];
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {!isModal && (
        <div>
          <h1 className="text-xl font-semibold">Create a quiz</h1>
          <p className="text-gray-500 text-sm">
            Add single choice, multiple choice, or fill-in-the-blank questions.
          </p>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Quiz title</label>
        <input
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="e.g. Chapter 2 Quiz"
          className="w-full mt-1 border rounded-lg px-4 py-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {QUESTION_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => addQuestion(t.id)}
            className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-purple-50 hover:border-purple-400 transition"
          >
            + {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Import
        </button>
      </div>

      {questions.map((q, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow p-5 space-y-4 relative border"
        >
          {questions.length > 1 && (
            <button
              type="button"
              onClick={() => deleteQuestion(i)}
              className="absolute top-4 right-4 text-red-500 text-sm hover:underline"
            >
              Delete
            </button>
          )}

          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 font-semibold">QUESTION {i + 1}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {typeLabel(q.type)}
            </span>
          </div>

          <textarea
            value={q.q}
            onChange={(e) => updateQuestion(i, { q: e.target.value })}
            placeholder={
              q.type === "fill_blank"
                ? "Type your question (use ___ for blank if needed)..."
                : "Type your question..."
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          {q.type === "radio" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, j) => (
                <div
                  key={j}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2"
                >
                  <input
                    type="radio"
                    checked={q.correct === j}
                    onChange={() => updateQuestion(i, { correct: j })}
                    className="accent-blue-600"
                  />
                  <input
                    value={opt}
                    placeholder={`Option ${j + 1}`}
                    onChange={(e) => updateOption(i, j, e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {q.type === "checkbox" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, j) => (
                <div
                  key={j}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={(q.correctIndices || []).includes(j)}
                    onChange={() => toggleCheckboxCorrect(i, j)}
                    className="accent-blue-600"
                  />
                  <input
                    value={opt}
                    placeholder={`Option ${j + 1}`}
                    onChange={(e) => updateOption(i, j, e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              ))}
              <p className="col-span-full text-xs text-gray-500">
                Check all correct answers
              </p>
            </div>
          )}

          {q.type === "fill_blank" && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Correct answer
              </label>
              <input
                value={q.blankAnswer || ""}
                onChange={(e) => updateQuestion(i, { blankAnswer: e.target.value })}
                placeholder="Enter the correct answer for the blank"
                className="w-full mt-1 border rounded-lg px-4 py-2"
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-3 pt-4">
        {isModal ? (
          <button
            type="button"
            onClick={() => onNext(buildPayload())}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            {isEdit ? "Update" : "Add"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep((prev) => prev - 1)}
              className="px-4 py-2 border rounded-lg"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onNext(buildPayload())}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Save & Next
            </button>
          </>
        )}
      </div>

      <button
        id="nextBtn"
        type="button"
        onClick={() => onNext(buildPayload())}
        className="hidden"
      />

      <QuizImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImportQuestions}
      />
    </div>
  );
}
