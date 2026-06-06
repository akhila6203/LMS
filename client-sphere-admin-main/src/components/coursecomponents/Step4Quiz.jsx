import { useEffect, useState } from "react";

// export default function Step4({ onNext, data = {}, setStep })

export default function Step4({ onNext, data, setStep, isModal = false, isEdit = false }){

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
  if (data?.questions?.length) {
    setQuestions(data.questions);
  } else if (data?.quizzes?.[0]?.questions?.length) {
    setQuestions(data.quizzes[0].questions);
  } else {
    setQuestions([{ q: "", options: ["", "", "", ""], correct: 0 }]);
  }

  if (data?.quizTitle) {
    setQuizTitle(data.quizTitle);
  } else if (data?.quizzes?.[0]?.quizTitle) {
    setQuizTitle(data.quizzes[0].quizTitle);
  }
}, [data]);


  // ➕ ADD QUESTION
  const addQ = () => {
    setQuestions((prev) => [
      ...prev,
      { q: "", options: ["", "", "", ""], correct: 0 },
    ]);
  };

  // ❌ DELETE QUESTION
  const deleteQuestion = (index) => {
    if (questions.length === 1) return; // prevent removing last
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  // ✏ UPDATE QUESTION
  const updateQuestion = (value, i) => {
    const updated = [...questions];
    updated[i].q = value;
    setQuestions(updated);
  };

  // ✏ UPDATE OPTION
  const updateOption = (value, i, j) => {
    const updated = [...questions];
    updated[i].options[j] = value;
    setQuestions(updated);
  };

  // ✅ SELECT CORRECT
  const updateCorrect = (i, j) => {
    const updated = [...questions];
    updated[i].correct = j;
    setQuestions(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {!isModal && (
        <div>
          <h1 className="text-xl font-semibold">Create a quiz</h1>
          <p className="text-gray-500 text-sm">
            Build multiple-choice questions for your students.
          </p>
        </div>
      )}

      {/* QUIZ TITLE */}
      <div>
        <label className="text-sm font-medium">Quiz title</label>
        <input
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="e.g. Module 2 Quiz"
          className="w-full mt-1 border rounded-lg px-4 py-2"
        />
      </div>

      {/* QUESTIONS */}
      {questions.map((q, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow p-5 space-y-4 relative"
        >

          {/* ❌ DELETE BUTTON */}
          {questions.length > 1 && (
            <button
              onClick={() => deleteQuestion(i)}
              className="absolute top-4 right-4 text-red-500 text-sm hover:underline"
            >
              Delete
            </button>
          )}

          <p className="text-sm text-gray-500 font-semibold">
            QUESTION {i + 1}
          </p>

          {/* QUESTION TEXT */}
          <textarea
            value={q.q}
            onChange={(e) => updateQuestion(e.target.value, i)}
            placeholder="Type your question..."
            className="w-full border rounded-lg px-4 py-3"
          />

          {/* OPTIONS */}
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, j) => (
              <div
                key={j}
                className="flex items-center gap-2 border rounded-lg px-3 py-2"
              >
                <input
                  type="radio"
                  checked={q.correct === j}
                  onChange={() => updateCorrect(i, j)}
                  className="accent-blue-600"
                />

                <input
                  value={opt}
                  placeholder={`Option ${j + 1}`}
                  onChange={(e) =>
                    updateOption(e.target.value, i, j)
                  }
                  className="w-full outline-none"
                />
              </div>
            ))}
          </div>

        </div>
      ))}

      {/* ➕ ADD QUESTION */}
      <button
        onClick={addQ}
        className="w-full border rounded-lg py-3 text-gray-600"
      >
        + Add another question
      </button>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 pt-4">

  {isModal ? (
    <>
      <button
        // onClick={() => onNext({ questions, quizTitle })}
        onClick={() =>
          onNext({
            quizzes: [
              {
                quizTitle,
                questions,
                attempts: data?.attempts ?? 0,
                passRate: data?.passRate ?? 0,
              },
            ],
          })
  // onNext({
  //   // questions,
  //   // quizTitle,
  //   // attempts: 0,
  //   // passRate: 0,
    
  // })
}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg"
      >
        {isEdit ? "Update" : "Add"}
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => setStep((prev) => prev - 1)}
        className="px-4 py-2 border rounded-lg"
      >
        Previous
      </button>

      <button
        // onClick={() => onNext({ questions, quizTitle })}
        onClick={() =>
          onNext({
            quizzes: [
              {
                quizTitle,
                questions,
                attempts: data?.attempts ?? 0,
                passRate: data?.passRate ?? 0,
              },
            ],
          })
  // onNext({
  //    quizTitle,
  //   questions,
  //   attempts: 0,
  //   passRate: 0,
  // })
}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        Save & Next
      </button>
    </>
  )}

</div>
      
      {/* hidden fallback */}
      <button
        id="nextBtn"
        // onClick={() => onNext({ questions, quizTitle })}
        onClick={() =>
  // onNext({
  //    quizTitle,
  //   questions,
  //   attempts: 0,
  //   passRate: 0,
  // })
  onNext({
  quizzes: [
    {
      quizTitle,
      questions,
      attempts: 0,
      passRate: 0,
    },
  ],
})
}
        className="hidden"
      />

    </div>
  );
}



