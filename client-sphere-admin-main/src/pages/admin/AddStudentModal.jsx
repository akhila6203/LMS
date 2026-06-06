import { useState } from "react";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export default function AddStudentModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      const res = await studentService.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || undefined,
        status,
      });
      setCredentials(res.data.credentials);
      toast.success("Student added to users table");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add student");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!credentials) return;
    const text = `Login URL: ${credentials.loginUrl}\nEmail: ${credentials.email}\nPassword: ${credentials.password}\n\n${credentials.note}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied");
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-1">Add student</h2>
        <p className="text-sm text-gray-500 mb-4">
          Creates a row in the <strong>users</strong> table. Share the password with the student
          or they can sign in with Google using the same email.
        </p>

        {!credentials ? (
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
            <div>
              <label className="text-sm text-gray-600">Password (optional)</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="Auto-generated if empty"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add to users table"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
              <p className="font-medium text-green-800 mb-2">Share these credentials</p>
              <p>
                <span className="text-gray-500">Email:</span> {credentials.email}
              </p>
              <p>
                <span className="text-gray-500">Password:</span>{" "}
                <code className="bg-white px-1 rounded">{credentials.password}</code>
              </p>
              <p className="text-xs text-gray-600 mt-2">{credentials.note}</p>
            </div>
            <button
              type="button"
              onClick={copyAll}
              className="flex items-center gap-2 text-sm text-purple-600 hover:underline"
            >
              <Copy className="w-4 h-4" /> Copy credentials
            </button>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
