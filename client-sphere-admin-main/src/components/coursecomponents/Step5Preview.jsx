import React from "react";

export default function Step5({ data = {}, onNext, setStep }) {

  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-400 text-center mt-10">No preview data</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Course Preview</h1>
        <p className="text-gray-500 text-sm">
          Review all details before publishing your course.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">

        {/* COURSE INFO */}
        <div className="flex gap-6 items-start">

          {/* THUMBNAIL */}
          {data?.thumbnail && (
            <img
              src={
                data.thumbnail instanceof File
                  ? URL.createObjectURL(data.thumbnail)
                  : data.thumbnail
              }
              className="w-48 h-28 object-cover rounded-lg"
            />
          )}

          {/* DETAILS */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{data.title}</h2>
            <p className="text-gray-500">{data.description}</p>

            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
              <p><b>Category:</b> {data.category}</p>
              <p><b>Sub category:</b> {data.subCategory}</p>
              <p><b>Class:</b> {data.classLevel || "—"}</p>
              <p><b>Subject:</b> {data.subject || "—"}</p>
              <p><b>Level:</b> {data.level}</p>
              <p><b>Instructor:</b> {data.instructor}</p>
              <p>
                <b>Status:</b>{" "}
                <span className={`px-2 py-1 rounded text-xs ${
                  data.status === "Active"
                    ? "bg-green-100 text-green-600"
                    : data.status === "Blocked"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}>
                  {data.status}
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* VIDEOS */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Videos</h3>

          {data?.videos?.length ? (
            <div className="space-y-2">
              {data.videos.map((v, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 flex justify-between"
                >
                  <div>
                    <p className="font-medium">{v.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">{v.url}</p>
                    {v.uploadedAt && (
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(v.uploadedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <span className="text-sm text-gray-400 shrink-0">
                    {v.duration}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No videos added</p>
          )}
        </div>

        {/* MATERIALS */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Materials</h3>

          {data?.materials?.length ? (
            <div className="space-y-2">
              {data.materials.map((m, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 flex justify-between"
                >
                  <p>📄 {m.title || m.name}</p>
                  <span className="text-sm text-gray-400">
                    {m.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No materials uploaded</p>
          )}
        </div>

        {/* QUIZ */}
        {/* QUIZ */}
<div>
  <h3 className="font-semibold mb-3 text-lg">Quiz</h3>

  {!data?.quizzes || data.quizzes.length === 0 ? (
    <p className="text-gray-400 text-sm">No quiz added</p>
  ) : (
    data.quizzes.map((quiz, qi) => (
      <div key={qi} className="space-y-4 mb-4">

        <h4 className="font-semibold text-blue-600">
          {quiz.quizTitle || "Quiz"}
        </h4>

        {quiz.questions?.map((q, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 space-y-2"
          >
            <p className="font-medium">
              Q{i + 1}: {q.q}
            </p>

            <ul className="text-sm space-y-1">
              {q.options.map((opt, j) => (
                <li
                  key={j}
                  className={`px-2 py-1 rounded ${
                    q.correct === j
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600"
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>
    ))
  )}
</div>
        {/* <div>
          <h3 className="font-semibold mb-3 text-lg">Quiz</h3>

          {data?.questions?.length ? (
            <div className="space-y-4">
              {data.questions.map((q, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <p className="font-medium">
                    Q{i + 1}: {q.q}
                  </p>

                  <ul className="text-sm space-y-1">
                    {q.options.map((opt, j) => (
                      <li
                        key={j}
                        className={`px-2 py-1 rounded ${
                          q.correct === j
                            ? "bg-green-100 text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No questions added</p>
          )}
        </div> */}

        {/* ACTION BUTTONS */}
        <div className="flex justify-between pt-6">

          {/* PREVIOUS */}
          <button
            onClick={() => setStep((prev) => prev - 1)}
            className="px-4 py-2 border rounded-lg"
          >
            Previous
          </button>

          {/* SAVE & NEXT */}
          <button
            onClick={() => onNext({})}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save & Next
          </button>

        </div>

      </div>

      {/* hidden fallback */}
      <button
        id="nextBtn"
        onClick={() => onNext({})}
        className="hidden"
      />

    </div>
  );
}


