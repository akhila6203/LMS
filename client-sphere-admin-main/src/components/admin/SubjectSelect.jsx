import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { subjectService } from "@/services/subjectService";

export default function SubjectSelect({
  value,
  onChange,
  classLevel = "",
  label = "Subject",
  required = true,
  className = "",
}) {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [addValue, setAddValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const containerRef = useRef(null);

  const loadSubjects = useCallback(() => {
    if (!classLevel) {
      setSubjects([]);
      return Promise.resolve([]);
    }

    return subjectService
      .getAll(classLevel)
      .then((res) => {
        const list = res.data?.items || [];
        setSubjects(list);
        return list;
      })
      .catch(() => {
        setSubjects([]);
        return [];
      });
  }, [classLevel]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    setAddMode(false);
    setAddValue("");
    setEditingId(null);
    setEditValue("");
    setOpen(false);
  }, [classLevel]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setAddMode(false);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const persistNewSubject = async (name) => {
    const trimmed = String(name || "").trim();
    if (!trimmed || !classLevel) return;
    if (subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Subject already exists");
      return;
    }
    try {
      await subjectService.create(trimmed, classLevel);
      await loadSubjects();
      onChange(trimmed);
      setAddMode(false);
      setAddValue("");
      setOpen(false);
      toast.success("Subject added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save subject");
    }
  };

  const handleEdit = async (subject) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error("Subject name is required");
      return;
    }
    try {
      await subjectService.update(subject.id, trimmed);
      if (value === subject.name) onChange(trimmed);
      await loadSubjects();
      setEditingId(null);
      setEditValue("");
      toast.success("Subject updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update subject");
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`Delete "${subject.name}"?`)) return;
    try {
      await subjectService.remove(subject.id);
      if (value === subject.name) onChange("");
      await loadSubjects();
      toast.success("Subject deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete subject");
    }
  };

  const disabled = !classLevel;
  const displayLabel = value || (disabled ? "Select class first" : "Select subject");

  return (
    <div className={className} ref={containerRef}>
      {label && <label className="text-sm text-gray-600">{label}</label>}

      <div className="relative mt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left disabled:bg-gray-100"
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>{displayLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
            <ul className="max-h-56 overflow-y-auto py-1">
              {subjects.map((subject) => (
                <li key={subject.id} className="group">
                  {editingId === subject.id ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(subject);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="min-w-0 flex-1 rounded border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleEdit(subject)}
                        className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          onChange(subject.name);
                          setOpen(false);
                        }}
                        className={`flex-1 text-left text-sm ${
                          value === subject.name ? "font-medium text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {subject.name}
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5 opacity-70 group-hover:opacity-100">
                        <button
                          type="button"
                          title="Edit subject"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(subject.id);
                            setEditValue(subject.name);
                            setAddMode(false);
                          }}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete subject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(subject);
                          }}
                          className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}

              <li className="border-t">
                {addMode ? (
                  <div className="px-2 py-2">
                    <input
                      type="text"
                      value={addValue}
                      onChange={(e) => setAddValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") persistNewSubject(addValue);
                        if (e.key === "Escape") {
                          setAddMode(false);
                          setAddValue("");
                        }
                      }}
                      onBlur={() => {
                        if (addValue.trim()) persistNewSubject(addValue);
                      }}
                      placeholder="Enter new subject name"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode(true);
                      setEditingId(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                  >
                    Add
                  </button>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="sr-only"
          tabIndex={-1}
        />
      )}
    </div>
  );
}
