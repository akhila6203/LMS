import { useState } from "react";
import { studentService } from "@/services/studentService";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import ClassSelect from "@/components/admin/ClassSelect";
import SchoolSelect from "@/components/admin/SchoolSelect";

export default function InviteStudentModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [school, setSchool] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    if (!email.trim()) {
      toast.error("Email is required");
      setLoading(false);
      return;
    }
    if (!classLevel) {
      toast.error("Please select a class");
      setLoading(false);
      return;
    }
    if (!school) {
      toast.error("Please select a school");
      setLoading(false);
      return;
    }

    try {
      const res = await studentService.invite(
        [{ name: name.trim(), email: email.trim().toLowerCase(), classLevel, school }],
        message,
        classLevel,
        school
      );
      setResults(res.data);
      toast.success(res.data.message || "Invite created");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send invite");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (link, index) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-1">Invite student</h2>
        <p className="text-sm text-gray-500 mb-4">
          Creates an invite link stored in MySQL. Share the link with the student
          to register.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full mt-1 border rounded-lg px-3 py-2"
              required
            />
          </div>

          <ClassSelect value={classLevel} onChange={setClassLevel} label="Class" />
          <SchoolSelect value={school} onChange={setSchool} label="School" />

          <div>
            <label className="text-sm font-medium">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2 h-20 text-sm"
            />
          </div>

          {results?.results?.length > 0 && (
            <div className="border rounded-lg p-3 bg-gray-50 space-y-2 max-h-40 overflow-auto">
              <p className="text-sm font-medium text-green-700">
                {results.message}
              </p>
              {results.results.map((r, i) => (
                <div key={i} className="text-xs border-t pt-2 first:border-0">
                  <p className="font-medium">{r.email}</p>
                  {r.success ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 truncate flex-1">
                        {r.inviteLink}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyLink(r.inviteLink, i)}
                        className="shrink-0 p-1 hover:bg-gray-200 rounded"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-red-600">{r.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}>
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create invite link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
