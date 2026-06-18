import { useState, useRef } from "react";
import { studentService } from "@/services/studentService";
import {
  parseStudentSpreadsheet,
  downloadStudentTemplate,
} from "@/utils/parseStudentFile";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export default function BulkImportModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const resetFileSelection = () => {
    setFile(null);
    setPreview([]);
    setParseError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = async (f) => {
    setFile(f);
    setResult(null);
    setParseError("");

    if (!f) {
      setPreview([]);
      return;
    }

    try {
      const rows = await parseStudentSpreadsheet(f);
      setPreview(rows);
      if (!rows.length) {
        setParseError(
          "No valid rows found. Columns: name, email, password, date, class, school"
        );
      }
    } catch {
      setParseError("Could not read file. Use .xlsx, .xls, or .csv");
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!preview.length) return;

    const missingClass = preview.some((row) => !row.classLevel);
    const missingSchool = preview.some((row) => !row.school);
    if (missingClass) {
      toast.error("Each row must include a class column in the Excel sheet");
      return;
    }
    if (missingSchool) {
      toast.error("Each row must include a school column in the Excel sheet");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await studentService.bulkImport(preview);
      setResult(res.data);
      if (res.data.imported > 0) {
        toast.success(res.data.message);
        resetFileSelection();
        onSuccess?.();
      } else {
        toast.warning(res.data.message || "No students imported");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Import failed";
      setResult({
        message: msg,
        imported: 0,
        skipped: 0,
        failed: preview.length,
        credentials: [],
        details: err.response?.data?.details,
      });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    const list = result?.credentials || [];
    if (!list.length) return;
    const text = list
      .map(
        (c) =>
          `${c.name} | ${c.email} | Password: ${c.password}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("All credentials copied");
  };

  const errorRows = result?.details?.errors || [];
  const skippedRows = result?.details?.skipped || [];
  const credentialRows = result?.credentials || [];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-1">Bulk import students</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload Excel/CSV with columns:{" "}
          <strong>name</strong>, <strong>email</strong>, <strong>password</strong>{" "}
          (optional), <strong>date</strong>, <strong>class</strong>, and{" "}
          <strong>school</strong> for each student.
        </p>

        <div className="border-2 border-dashed p-8 text-center rounded-xl">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            id="bulkStudentFile"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <label htmlFor="bulkStudentFile" className="cursor-pointer text-gray-600">
            Drop Excel/CSV or click to upload
          </label>
          {file && <p className="text-green-600 mt-2 text-sm">{file.name}</p>}
        </div>

        <div className="flex justify-between mt-3 text-sm">
          <span className="text-gray-500">Download sample template</span>
          <button
            type="button"
            onClick={() => downloadStudentTemplate()}
            className="text-blue-600 hover:underline"
          >
            Download template (.xlsx / .csv)
          </button>
        </div>

        {parseError && (
          <p className="text-red-600 text-sm mt-3">{parseError}</p>
        )}

        {preview.length > 0 && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <p className="text-sm font-medium p-3 bg-gray-50 border-b">
              Preview ({preview.length} rows)
            </p>
            <div className="max-h-48 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Password</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">School</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.email}</td>
                      <td className="p-2">{row.password || "(auto)"}</td>
                      <td className="p-2">{row.date || "—"}</td>
                      <td className="p-2">{row.classLevel || "—"}</td>
                      <td className="p-2">{row.school || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="text-xs text-gray-400 p-2">
                  +{preview.length - 10} more rows
                </p>
              )}
            </div>
          </div>
        )}

        {result && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              result.imported > 0 ? "bg-green-50 text-green-800" : "bg-amber-50"
            }`}
          >
            <p className="font-medium">{result.message}</p>
            <p>
              Imported: {result.imported} · Skipped: {result.skipped} · Failed:{" "}
              {result.failed}
            </p>

            {credentialRows.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Student credentials (give to users)</p>
                  <button
                    type="button"
                    onClick={copyCredentials}
                    className="flex items-center gap-1 text-purple-700 hover:underline text-xs"
                  >
                    <Copy className="w-3 h-3" /> Copy all
                  </button>
                </div>
                <div className="max-h-40 overflow-auto border rounded bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {credentialRows.map((c, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{c.name}</td>
                          <td className="p-2">{c.email}</td>
                          <td className="p-2 font-mono">{c.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {skippedRows.length > 0 && (
              <ul className="mt-2 text-xs list-disc pl-4 max-h-24 overflow-auto">
                {skippedRows.slice(0, 5).map((s, i) => (
                  <li key={i}>
                    Row {s.row}: {s.email} — {s.reason}
                  </li>
                ))}
              </ul>
            )}
            {errorRows.length > 0 && (
              <ul className="mt-2 text-xs text-red-700 list-disc pl-4 max-h-24 overflow-auto">
                {errorRows.slice(0, 5).map((e, i) => (
                  <li key={i}>
                    Row {e.row}: {e.email} — {e.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} disabled={loading}>
            {result?.imported > 0 ? "Close" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !preview.length}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import to users table"}
          </button>
        </div>
      </div>
    </div>
  );
}
