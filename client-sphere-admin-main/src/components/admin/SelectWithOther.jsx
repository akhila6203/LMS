import { useEffect, useState } from "react";

const OTHERS = "__others__";

export default function SelectWithOther({
  label,
  value,
  onChange,
  options = [],
  required = true,
  className = "",
  emptyLabel = "Select",
  otherLabel = "Others",
  otherPlaceholder = "Enter name",
  disabled = false,
  onCustomCommit,
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
      if (!valueIsCustom) onChange("");
      return;
    }
    if (picked === "") {
      setOthersMode(false);
      onChange("");
      return;
    }
    setOthersMode(false);
    onChange(picked);
  };

  return (
    <div className={className}>
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <select
        className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100"
        value={selectValue}
        onChange={handleSelect}
        required={required && !othersMode}
        disabled={disabled}
      >
        <option value="">{emptyLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value={OTHERS}>{otherLabel}</option>
      </select>
      {othersMode && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            const trimmed = String(value || "").trim();
            if (trimmed) onCustomCommit?.(trimmed);
          }}
          placeholder={otherPlaceholder}
          className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-purple-500 outline-none"
          required={required}
        />
      )}
    </div>
  );
}
