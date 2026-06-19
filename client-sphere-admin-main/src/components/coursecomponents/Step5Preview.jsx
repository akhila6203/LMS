import React from "react";

function QuestionPreview({ question, index }) {
  const q = question || {};
  const type = q.type || "radio";
  const text = q.q || q.question || "";
  const options = Array.isArray(q.options) ? q.options : [];

  if (type === "fill_blank") {
    return (
      <div className="border rounded-lg p-4 space-y-2">
        <p className="font-medium">
          Q{index + 1}: {text || "—"}
        </p>
        <p className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
          Answer: {q.blankAnswer || "—"}
        </p>
      </div>
    );
  }

  if (type === "checkbox") {
    const correctSet = new Set(q.correctIndices || []);
    return (
      <div className="border rounded-lg p-4 space-y-2">
        <p className="font-medium">
          Q{index + 1}: {text || "—"}
        </p>
        {options.length ? (
          <ul className="text-sm space-y-1">
            {options.map((opt, j) => (
              <li
                key={j}
                className={`px-2 py-1 rounded ${
                  correctSet.has(j)
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600"
                }`}
              >
                {opt || `Option ${j + 1}`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No options</p>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <p className="font-medium">
        Q{index + 1}: {text || "—"}
      </p>
      {options.length ? (
        <ul className="text-sm space-y-1">
          {options.map((opt, j) => (
            <li
              key={j}
              className={`px-2 py-1 rounded ${
                q.correct === j
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600"
              }`}
            >
              {opt || `Option ${j + 1}`}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">No options</p>
      )}
    </div>
  );
}

export default function Step5({ data = {}, onNext, setStep }) {
  const videos = data?.videos || [];
  const materials = data?.materials || [];
  const quizzes = data?.quizzes || [];
  const questionCount = quizzes.reduce(
    (sum, quiz) => sum + (quiz?.questions?.length || 0),
    0
  );

  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-400 text-center mt-10">No preview data</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Class Preview</h1>
        <p className="text-gray-500 text-sm">
          Review all details before publishing your course.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700">
          {videos.length} video{videos.length !== 1 ? "s" : ""}
        </span>
        <span className="text-sm px-3 py-1 rounded-full bg-purple-50 text-purple-700">
          {materials.length} material{materials.length !== 1 ? "s" : ""}
        </span>
        <span className="text-sm px-3 py-1 rounded-full bg-green-50 text-green-700">
          {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
          {questionCount > 0 ? ` · ${questionCount} question${questionCount !== 1 ? "s" : ""}` : ""}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <div className="flex gap-6 items-start">
          {data?.thumbnail && (
            <img
              src={
                data.thumbnail instanceof File
                  ? URL.createObjectURL(data.thumbnail)
                  : data.thumbnail
              }
              alt="Class thumbnail"
              className="w-48 h-28 object-cover rounded-lg"
            />
          )}

          <div className="space-y-2">
            <h2 className="text-xl font-bold">{data.title || "—"}</h2>
            <p className="text-gray-500">{data.description || "—"}</p>

            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
              <p>
                <b>Class:</b> {data.classLevel || data.category || "—"}
              </p>
              <p>
                <b>Subject:</b> {data.subject || data.subCategory || "—"}
              </p>
              <p>
                <b>Mentor Name:</b> {data.mentor || data.instructor || "—"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-lg">Videos ({videos.length})</h3>
          {videos.length ? (
            <div className="space-y-2">
              {videos.map((v, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 flex justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{v.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {v.url}
                    </p>
                    {v.uploadedAt && (
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(v.uploadedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 shrink-0">
                    {v.duration || "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No videos added</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-lg">
            Materials ({materials.length})
          </h3>
          {materials.length ? (
            <div className="space-y-2">
              {materials.map((m, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 flex justify-between"
                >
                  <p>📄 {m.title || m.name}</p>
                  <span className="text-sm text-gray-400">{m.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No materials uploaded</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-lg">Quiz</h3>
          {!quizzes.length ? (
            <p className="text-gray-400 text-sm">No quiz added</p>
          ) : (
            quizzes.map((quiz, qi) => (
              <div key={qi} className="space-y-4 mb-4">
                <h4 className="font-semibold text-blue-600">
                  {quiz.quizTitle || "Quiz"}
                </h4>
                {(quiz.questions || []).map((q, i) => (
                  <QuestionPreview key={i} question={q} index={i} />
                ))}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => setStep((prev) => prev - 1)}
            className="px-4 py-2 border rounded-lg"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onNext({})}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save & Next
          </button>
        </div>
      </div>

      <button
        id="nextBtn"
        type="button"
        onClick={() => onNext({})}
        className="hidden"
      />
    </div>
  );
}
