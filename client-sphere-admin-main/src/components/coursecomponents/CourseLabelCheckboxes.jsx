import { COURSE_LABEL_GROUPS } from "@/lib/courseLabels";

export default function CourseLabelCheckboxes({ value = [], onChange }) {
  const selected = new Set(value);

  const toggle = (label) => {
    const next = new Set(selected);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    onChange([...next]);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Course labels</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Select one or more. These control where the course appears for learners
          (Popular, Trending, Recommended, etc.).
        </p>
      </div>

      {COURSE_LABEL_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            {group.title}
          </p>
          <div className="flex flex-wrap gap-3">
            {group.options.map((label) => (
              <label
                key={label}
                className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                  selected.has(label)
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={selected.has(label)}
                  onChange={() => toggle(label)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
