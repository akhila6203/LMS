import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  parseQuizSpreadsheet,
  downloadQuizTemplate,
} from "@/utils/parseQuizFile";

export default function QuizImportModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setPreview([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (f) => {
    setFile(f);
    setError("");
    if (!f) {
      setPreview([]);
      return;
    }

    setLoading(true);
    try {
      const questions = await parseQuizSpreadsheet(f);
      setPreview(questions);
      if (!questions.length) {
        setError(
          "No valid questions found. Use columns: type, question, option1–4, correct, blank_answer"
        );
      }
    } catch (err) {
      setError(err.message || "Could not read file. Use .xlsx, .xls, .csv, .txt, .pdf, or .docx");
      setPreview([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview.length) return;
    onImport(preview);
    toast.success(`Imported ${preview.length} question(s)`);
    handleClose();
  };

  if (!open) return null;

  const typeLabel = (type) => {
    if (type === "checkbox") return "Multiple choice";
    if (type === "fill_blank") return "Fill in blank";
    return "Single choice";
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Import quiz questions</h2>
            <p className="text-sm text-gray-500 mt-1">
              Best results with Excel (.xlsx) or CSV. Questions with options go to
              single/multiple choice; fill-in-the-blank rows go to blank type
              automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-2 border-dashed rounded-xl p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.txt,.pdf,.docx"
            className="hidden"
            id="quizImportFile"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <label
            htmlFor="quizImportFile"
            className="cursor-pointer flex flex-col items-center gap-2 text-gray-600"
          >
            <Upload className="w-8 h-8 text-purple-500" />
            <span>Drop Excel/CSV/PDF/Word or click to upload</span>
            <span className="text-xs text-gray-400">
              Recommended: .xlsx or .csv (Download template below)
            </span>
          </label>
          {file && (
            <p className="text-green-600 mt-3 text-sm font-medium">{file.name}</p>
          )}
        </div>

        <div className="flex justify-between mt-3 text-sm">
          <span className="text-gray-500">Need a format guide?</span>
          <button
            type="button"
            onClick={() => downloadQuizTemplate()}
            className="text-blue-600 hover:underline"
          >
            Download template (.xlsx)
          </button>
        </div>

        {loading && (
          <p className="text-sm text-gray-500 mt-3 text-center">Reading file...</p>
        )}

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        {preview.length > 0 && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <p className="text-sm font-medium p-3 bg-gray-50 border-b">
              Preview ({preview.length} questions)
            </p>
            <div className="max-h-52 overflow-auto divide-y">
              {preview.slice(0, 8).map((q, i) => (
                <div key={i} className="p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400">
                      Q{i + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {typeLabel(q.type)}
                    </span>
                  </div>
                  <p className="line-clamp-2">{q.q}</p>
                  {q.type === "fill_blank" && q.blankAnswer && (
                    <p className="text-xs text-gray-500 mt-1">
                      Answer: {q.blankAnswer}
                    </p>
                  )}
                </div>
              ))}
              {preview.length > 8 && (
                <p className="text-xs text-gray-400 p-3">
                  +{preview.length - 8} more questions
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!preview.length || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            Add {preview.length ? preview.length : ""} question
            {preview.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
