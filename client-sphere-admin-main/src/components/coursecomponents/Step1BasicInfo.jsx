import { useState, useEffect } from "react";
import {
  CATEGORIES,
  CATEGORY_TABS,
  CLASS_OPTIONS,
  SUBJECT_OPTIONS,
} from "@/lib/catalog";
import { normalizeCourseLabels, parseCourseLabels } from "@/lib/courseLabels";
import CourseLabelCheckboxes from "./CourseLabelCheckboxes";

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
    category: "",
    subCategory: "",
    subject: "",
    classLevel: "",
    instructor: "",
    level: "Beginner",
    labels: ["Beginner"],
    description: "",
    status: "Pending",
    students: 0,
    price: 0,
    discountPercent: 0,
    thumbnail: null,
  });

  const [overview, setOverview] = useState(data.overview || [""]);
  const categoryOptions = CATEGORIES.filter((c) => c !== "All");
  const categoryFromList = categoryOptions.includes(form.category);
  const subCategoryOptions =
    categoryFromList && CATEGORY_TABS[form.category]
      ? CATEGORY_TABS[form.category]
      : [];

  const handleCategoryChange = (category) => {
    setForm((prev) => {
      const prevFromList = categoryOptions.includes(prev.category);
      const nextFromList = categoryOptions.includes(category);
      const resetSub =
        (nextFromList && category !== prev.category) ||
        prevFromList !== nextFromList;

      return {
        ...prev,
        category,
        subCategory: resetSub ? "" : prev.subCategory,
      };
    });
  };

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || "",
        category: data.category || "",
        subCategory: data.subCategory || data.sub_category || "",
        subject: data.subject || "",
        classLevel: data.classLevel || "",
        instructor: data.instructor || "",
        level: data.level || "Beginner",
        labels: (() => {
          const parsed = parseCourseLabels(data);
          if (parsed.length) return parsed;
          if (data.level) return [data.level];
          return ["Beginner"];
        })(),
        description: data.description || "",
        status: data.status || "Pending",
        students: data.students || 0,
        price: data.price ?? 0,
        discountPercent: data.discountPercent ?? data.discount_percent ?? 0,
        thumbnail: data.thumbnail || null,
      });
      setOverview(data.overview?.length ? data.overview : [""]);
    }
  }, [data]);

  const patch = (fields) => setForm((prev) => ({ ...prev, ...fields }));

  const handleSubmit = () => {
    if (!form.title.trim()) {
      alert("Course title is required");
      return;
    }
    const labels = normalizeCourseLabels(form.labels);
    onNext({
      ...form,
      labels,
      overview: overview.filter((x) => x.trim()),
      category: form.category.trim(),
      subCategory: form.subCategory.trim(),
      classLevel: form.classLevel.trim(),
      subject: form.subject.trim(),
    });
    
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!isModal && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create a new course</h1>
          <p className="text-gray-500 text-sm">
            Enter course details shown to students in your LMS.
          </p>
        </div>
      )}

      <div className={`space-y-6 ${isModal ? "" : "bg-white rounded-2xl shadow p-6"}`}>
        {!isModal && (
          <div>
            <h2 className="font-semibold text-lg">Course details</h2>
            <p className="text-sm text-gray-500">
              Category, class, subject, and basic information.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Course title</label>
          <input
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Advanced React Patterns"
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
            label="Category"
            value={form.category}
            onValueChange={handleCategoryChange}
            options={categoryOptions}
            emptyLabel="Select category"
            otherPlaceholder="Enter category name"
          />

          <SelectWithOther
            key={`sub-${form.category || "none"}`}
            label="Sub category"
            value={form.subCategory}
            onValueChange={(subCategory) => patch({ subCategory })}
            options={subCategoryOptions}
            disabled={!form.category?.trim()}
            emptyLabel={
              categoryFromList
                ? "Select sub category"
                : "Select or choose Others"
            }
            otherPlaceholder="Enter sub category name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectWithOther
            label="Class"
            value={form.classLevel}
            onValueChange={(classLevel) => patch({ classLevel })}
            options={CLASS_OPTIONS}
            emptyLabel="Select class"
            otherPlaceholder="Enter class / grade"
          />

          <SelectWithOther
            label="Subject"
            value={form.subject}
            onValueChange={(subject) => patch({ subject })}
            options={SUBJECT_OPTIONS}
            emptyLabel="Select subject"
            otherPlaceholder="Enter subject name"
          />
        </div>

        <CourseLabelCheckboxes
          value={form.labels}
          onChange={(labels) => patch({ labels: normalizeCourseLabels(labels) })}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => patch({ price: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={(e) => patch({ discountPercent: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Students</label>
            <input
              type="number"
              value={form.students}
              onChange={(e) => patch({ students: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <div className="flex gap-4">
            {["Active", "Pending", "Blocked"].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={form.status === s}
                  onChange={(e) => patch({ status: e.target.value })}
                  className="accent-blue-600"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Course Thumbnail
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
