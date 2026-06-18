import { useState } from "react";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import ClassSelect from "@/components/admin/ClassSelect";
import SchoolSelect from "@/components/admin/SchoolSelect";

export default function EditStudentModal({ student, onClose, onSuccess }) {
  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [classLevel, setClassLevel] = useState(student?.classLevel || "");
  const [school, setSchool] = useState(student?.school || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!classLevel) {
      toast.error("Please select a class");
      return;
    }
    if (!school.trim()) {
      toast.error("Please select or enter a school name");
      return;
    }

    setLoading(true);
    try {
      await studentService.update(student.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        classLevel,
        school: school.trim(),
      });
      toast.success("Student updated");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-1">Edit student</h2>
        <p className="text-sm text-gray-500 mb-4">
          Update student details. Changes are saved to the same user record.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Full name</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
            />
          </div>
          <ClassSelect value={classLevel} onChange={setClassLevel} />
          <SchoolSelect value={school} onChange={setSchool} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
