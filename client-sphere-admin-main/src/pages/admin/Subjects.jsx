import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClassSelect from "@/components/admin/ClassSelect";
import { subjectService } from "@/services/subjectService";

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subjectService.getAll(classFilter || undefined);
      setSubjects(res.data?.items || []);
    } catch {
      toast.error("Could not load subjects");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setClassLevel("");
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const openCreate = () => {
    resetForm();
    setClassLevel(classFilter || "");
    setOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setName(subject.name);
    setClassLevel(subject.classLevel);
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Subject name is required");
      return;
    }
    if (!editing && !classLevel) {
      toast.error("Class is required");
      return;
    }

    try {
      if (editing) {
        await subjectService.update(editing.id, trimmed);
        toast.success("Subject updated");
      } else {
        await subjectService.create(trimmed, classLevel);
        toast.success("Subject added");
      }
      handleOpenChange(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save subject");
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`Delete "${subject.name}" for ${subject.classLevel}?`)) return;

    try {
      await subjectService.remove(subject.id);
      toast.success("Subject deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete subject");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage subjects per class. Only admin-added subjects appear on the user side
            after a class with lessons is published.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <FaPlus className="h-3.5 w-3.5" />
          Add subject
        </Button>
      </div>

      <div className="max-w-xs">
        <ClassSelect
          label="Filter by class"
          value={classFilter}
          onChange={setClassFilter}
          required={false}
          emptyLabel="All classes"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : subjects.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No subjects yet. Add one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{subject.classLevel}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(subject)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    aria-label={`Edit ${subject.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(subject)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition hover:bg-destructive/10"
                    aria-label={`Delete ${subject.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit subject" : "Add subject"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the subject name. Linked classes will be updated automatically."
                : "Create a new subject for a class level."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {!editing && (
              <ClassSelect
                label="Class"
                value={classLevel}
                onChange={setClassLevel}
                required
              />
            )}
            {editing && (
              <p className="text-sm text-muted-foreground">
                Class: <span className="font-medium text-foreground">{classLevel}</span>
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Subject name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Communication"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
