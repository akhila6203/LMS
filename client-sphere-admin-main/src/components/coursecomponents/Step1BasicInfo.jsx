import { useState, useEffect, useMemo } from "react";
import { CLASS_OPTIONS, getSubjectsForClass } from "@/lib/catalog";

const OTHERS = "__others__";

function SelectWithOther({
  label,
  value,
  onValueChange,
  options = [],
  disabled = false,
  emptyLabel = "Select",
  otherPlaceholder = "Enter your own",
}) {
  const valueIsCustom = Boolean(value) && !options.includes(value);
  const [othersMode, setOthersMode] = useState(valueIsCustom);

  useEffect(() => {
    if (value && !options.includes(value)) {
      setOthersMode(true);
    } else if (value && options.includes(value)) {
      setOthersMode(false);
    }
  }, [value, options]);

  const selectValue = othersMode ? OTHERS : value || "";

  const handleSelect = (e) => {
    const picked = e.target.value;
    if (picked === OTHERS) {
      setOthersMode(true);
      if (!valueIsCustom) onValueChange("");
      return;
    }
    if (picked === "") {
      setOthersMode(false);
      onValueChange("");
      return;
    }
    setOthersMode(false);
    onValueChange(picked);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={selectValue}
        onChange={handleSelect}
        disabled={disabled}
        className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{emptyLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value={OTHERS}>Others</option>
      </select>
      {othersMode && (
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="w-full border rounded-lg px-4 py-2 mt-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      )}
    </div>
  );
}

export default function Step1({ onNext, data = {}, setStep, isModal = false }) {
  const [form, setForm] = useState({
    title: "",
    classLevel: "",
    subject: "",
    instructor: "",
    description: "",
    thumbnail: null,
  });

  const [overview, setOverview] = useState(data.overview || [""]);

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || "",
        classLevel: data.classLevel || data.category || "",
        subject: data.subject || data.subCategory || data.sub_category || "",
        instructor: data.instructor || "",
        description: data.description || "",
        thumbnail: data.thumbnail || null,
      });
      setOverview(data.overview?.length ? data.overview : [""]);
    }
  }, [data]);

  const patch = (fields) => setForm((prev) => ({ ...prev, ...fields }));

  const subjectOptions = useMemo(
    () => getSubjectsForClass(form.classLevel),
    [form.classLevel]
  );

  const handleClassChange = (classLevel) => {
    const nextSubjects = getSubjectsForClass(classLevel);
    const keepSubject = nextSubjects.includes(form.subject);
    patch({
      classLevel,
      subject: keepSubject ? form.subject : "",
    });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      alert("Course title is required");
      return;
    }
    if (!form.classLevel.trim()) {
      alert("Class is required");
      return;
    }
    if (!form.subject.trim()) {
      alert("Subject is required");
      return;
    }

    const classLevel = form.classLevel.trim();
    const subject = form.subject.trim();

    onNext({
      ...form,
      classLevel,
      subject,
      category: classLevel,
      subCategory: subject,
      overview: overview.filter((x) => x.trim()),
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!isModal && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create a new course</h1>
          <p className="text-gray-500 text-sm">
            Enter class details shown to students in your LMS.
          </p>
        </div>
      )}

      <div className={`space-y-6 ${isModal ? "" : "bg-white rounded-2xl shadow p-6"}`}>
        {!isModal && (
          <div>
            <h2 className="font-semibold text-lg">Course details</h2>
            <p className="text-sm text-gray-500">
              Class, subject, and basic information.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Course title</label>
          <input
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Class 5 Mathematics — Fractions"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="What will students learn?"
            className="w-full border rounded-lg px-4 py-3 h-28 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructor</label>
          <input
            value={form.instructor}
            onChange={(e) => patch({ instructor: e.target.value })}
            placeholder="Full name"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectWithOther
            label="Class"
            value={form.classLevel}
            onValueChange={handleClassChange}
            options={CLASS_OPTIONS}
            emptyLabel="Select class"
            otherPlaceholder="Enter class / grade"
          />

          <SelectWithOther
            label="Subject"
            value={form.subject}
            onValueChange={(subject) => patch({ subject })}
            options={subjectOptions}
            disabled={!form.classLevel.trim()}
            emptyLabel={form.classLevel ? "Select subject" : "Select class first"}
            otherPlaceholder="Enter subject name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Class Thumbnail
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const MAX_WIDTH = 1000;
                  const scale = MAX_WIDTH / img.width;
                  canvas.width = MAX_WIDTH;
                  canvas.height = img.height * scale;
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const compressed = canvas.toDataURL("image/jpeg", 0.9);
                  patch({ thumbnail: compressed });
                };
              };
              reader.readAsDataURL(file);
            }}
            className="w-full border rounded-lg px-3 py-2"
          />
          {form.thumbnail && (
            <img
              src={form.thumbnail}
              alt="thumbnail"
              className="w-40 h-24 object-cover rounded mt-3"
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Overview / What you'll learn</label>

          {overview.map((item, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <input
                value={item}
                onChange={(e) => {
                  const updated = [...overview];
                  updated[index] = e.target.value;
                  setOverview(updated);
                }}
                placeholder="e.g. Build real LMS project"
                className="w-full border rounded-lg px-4 py-2"
              />

              <button
                type="button"
                onClick={() =>
                  setOverview(overview.filter((_, i) => i !== index))
                }
                className="px-3 border rounded-lg"
              >
                X
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setOverview([...overview, ""])}
            className="mt-2 text-blue-600 text-sm"
          >
            + Add overview point
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {isModal ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              Update
            </button>
          ) : (
            <>
              {setStep && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 border rounded-lg"
                  disabled
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save & Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
