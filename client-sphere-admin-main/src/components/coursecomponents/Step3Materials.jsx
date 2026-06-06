import { useState, useEffect } from "react";
import { uploadService } from "@/services/uploadService";

function formatUploadTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Step3({ onNext, data = {}, setStep, isModal = false, isEdit = false }) {
  const [form, setForm] = useState({
    title: "",
    type: "PDF",
    url: "",
    uploadedAt: "",
  });

  const [dragActive, setDragActive] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const existing = data?.materials || [];
    if (isEdit && existing[0]) {
      const m = existing[0];
      setForm({
        title: m.title || m.name || "",
        type: m.type || "PDF",
        url: m.url || "",
        uploadedAt: m.uploadedAt || m.createdAt || "",
      });
      setMaterials([]);
    } else {
      setForm({ title: "", type: "PDF", url: "", uploadedAt: "" });
      setMaterials(isEdit ? [] : existing);
    }
  }, [data, isEdit]);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.material(file);
      setForm((prev) => ({
        ...prev,
        url: res.data.url,
        uploadedAt: res.data.uploadedAt,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
  };

  const addCurrentMaterial = () => {
    if (!form.title?.trim()) {
      alert("Material title is required");
      return;
    }
    setMaterials((prev) => [
      ...prev,
      {
        title: form.title.trim(),
        type: form.type || "PDF",
        url: form.url || "",
        uploadedAt: form.uploadedAt || new Date().toISOString(),
      },
    ]);
    setForm({ title: "", type: "PDF", url: "", uploadedAt: "" });
  };

  const buildMaterialFromForm = () => ({
    title: form.title.trim(),
    type: form.type || "PDF",
    url: form.url || "",
    uploadedAt: form.uploadedAt || new Date().toISOString(),
  });

  const collectMaterials = () => {
    if (isEdit) {
      if (form.title?.trim()) return [buildMaterialFromForm()];
      return data?.materials || [];
    }
    if (materials.length > 0) return materials;
    if (form.title?.trim()) return [buildMaterialFromForm()];
    return data?.materials || [];
  };

  const goNext = () => onNext({ materials: collectMaterials() });

  return (
    <div className="max-w-5xl mx-auto">
      {!isModal && (
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Add material</h1>
          <p className="text-gray-500 text-sm">
            Upload PDFs, docs, or other files for students.
          </p>
        </div>
      )}

      <div className={`space-y-5 ${isModal ? "" : "bg-white rounded-2xl shadow p-6"}`}>
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Chapter 1 reading"
            className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full mt-1 border rounded-lg px-4 py-2"
          >
            <option>PDF</option>
            <option>DOC</option>
            <option>DOCX</option>
            <option>PPT</option>
            <option>PPTX</option>
            <option>Image</option>
            <option>ZIP</option>
            <option>Link</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">File URL (optional)</label>
          <input
            value={form.url}
            onChange={(e) =>
              setForm({
                ...form,
                url: e.target.value,
                uploadedAt: form.uploadedAt || new Date().toISOString(),
              })
            }
            placeholder="https://... or upload below"
            className="w-full mt-1 border rounded-lg px-4 py-2"
          />
        </div>

        {form.uploadedAt && (
          <p className="text-xs text-green-700">
            Uploaded: {formatUploadTime(form.uploadedAt)}
          </p>
        )}

        {!isEdit && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addCurrentMaterial}
              disabled={uploading}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              + Add material to list
            </button>
          </div>
        )}

        {!isEdit && materials.length > 0 && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">
              Added materials ({materials.length})
            </p>
            {materials.map((m, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 text-sm border-b pb-2 last:border-0"
              >
                <div>
                  <span className="font-medium">{m.title}</span>
                  <span className="text-gray-500"> ({m.type})</span>
                  {m.uploadedAt && (
                    <p className="text-gray-400 text-xs">
                      {formatUploadTime(m.uploadedAt)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="text-red-500 shrink-0"
                  onClick={() =>
                    setMaterials((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">Upload file</label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              ${uploading ? "opacity-60 pointer-events-none" : "cursor-pointer"}
            `}
          >
            <input
              type="file"
              className="hidden"
              id="materialUpload"
              disabled={uploading}
              onChange={(e) => uploadFile(e.target.files[0])}
            />
            <label htmlFor="materialUpload" className="cursor-pointer block">
              <div className="text-gray-500">
                {uploading ? "Uploading..." : "Drop file or click to upload"}
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {isModal ? (
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              {isEdit ? "Update" : "Add"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2 border rounded-lg"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save & Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
