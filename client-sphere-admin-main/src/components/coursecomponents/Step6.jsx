

import { useState, useEffect } from "react";

export default function Step6({ onNext, data = {}, setStep, saving = false }) {

  const [status, setStatus] = useState("Draft");

  useEffect(() => {
    if (data?.status) setStatus(data.status);
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Publish Course</h1>
        <p className="text-gray-500 text-sm">
          Choose how your course will be available to students.
        </p>
      </div>

      {/* OPTIONS */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* DRAFT */}
        <div
          onClick={() => setStatus("Draft")}
          className={`cursor-pointer border rounded-xl p-5 transition
          ${
            status === "Draft"
              ? "border-blue-600 bg-blue-50 shadow"
              : "hover:border-gray-300"
          }`}
        >
          <h3 className="font-medium">Save as Draft</h3>
          <p className="text-sm text-gray-500 mt-1">
            Not visible to students.
          </p>
        </div>

        {/* ACTIVE */}
        <div
          onClick={() => setStatus("Active")}
          className={`cursor-pointer border rounded-xl p-5 transition
          ${
            status === "Active"
              ? "border-green-600 bg-green-50 shadow"
              : "hover:border-gray-300"
          }`}
        >
          <h3 className="font-medium">Publish Course</h3>
          <p className="text-sm text-gray-500 mt-1">
            Visible to students.
          </p>
        </div>

      </div>

      {/* STATUS PREVIEW */}
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Current status</p>
        <p className="font-semibold mt-1">
          {status === "Active" ? "Published" : "Draft"}
        </p>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between">

        <button
          onClick={() => setStep((prev) => prev - 1)}
          className="px-4 py-2 border rounded-lg"
        >
          Previous
        </button>

        <button
          onClick={() => onNext({ status })}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-60"
        >
          {saving ? "Saving to database..." : "Save & Finish"}
        </button>

      </div>

    </div>
  );
}
