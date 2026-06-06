const steps = [
  "Course Info",
  "Videos",
  "Materials",
  "Quiz",
  "Preview",
  "Publish",
];

export default function StepHeader({ step }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow mb-3">

      {/* <h2 className="text-xl font-bold mb-6">Create Course</h2> */}

      <div className="flex items-center">

        {steps.map((label, i) => {
          const s = i + 1;

          return (
            <div key={s} className="flex items-center flex-1">

  {/* CIRCLE */}
  <div className="flex flex-col items-center min-w-[80px]">

    <div
      className={`w-10 h-10 flex items-center justify-center rounded-full z-10
      ${
        step === s
          ? "bg-blue-600 text-white"
          : "bg-gray-300"
      }`}
    >
      {s}
    </div>

    <span className="text-xs mt-2">{label}</span>
  </div>

  {/* LINE */}
  {i !== steps.length - 1 && (
    <div className="flex-1 h-[2px] bg-gray-300 relative top-[-10px]">
      <div
        className={`h-full ${
          step > s ? "bg-blue-600" : ""
        }`}
      />
    </div>
  )}

</div>
          );
        })}

      </div>

    </div>
  );
}

