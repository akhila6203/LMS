import { CLASS_OPTIONS } from "@/lib/catalog";
import SelectWithOther from "./SelectWithOther";

export default function ClassSelect({
  value,
  onChange,
  label = "Class",
  required = true,
  className = "",
}) {
  return (
    <SelectWithOther
      label={label}
      value={value}
      onChange={onChange}
      options={CLASS_OPTIONS}
      required={required}
      className={className}
      emptyLabel="Select class (1–9)"
      otherPlaceholder="Enter class / grade"
    />
  );
}
