import { useCallback, useEffect, useState } from "react";
import { schoolService } from "@/services/schoolService";
import SelectWithOther from "./SelectWithOther";

export default function SchoolSelect({
  value,
  onChange,
  label = "School",
  required = true,
  className = "",
}) {
  const [schools, setSchools] = useState([]);

  const loadSchools = useCallback(() => {
    return schoolService
      .getAll()
      .then((res) => {
        const list = res.data?.schools || [];
        setSchools(list);
        return list;
      })
      .catch(() => {
        setSchools([]);
        return [];
      });
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const persistNewSchool = async (name) => {
    const trimmed = String(name || "").trim();
    if (!trimmed || schools.includes(trimmed)) return;
    try {
      await schoolService.create(trimmed);
      await loadSchools();
    } catch (err) {
      console.error("Could not save school:", err);
    }
  };

  return (
    <SelectWithOther
      label={label}
      value={value}
      onChange={onChange}
      options={schools}
      required={required}
      className={className}
      emptyLabel="Select school"
      otherLabel="Add"
      otherPlaceholder="Enter new school name"
      onCustomCommit={persistNewSchool}
    />
  );
}
