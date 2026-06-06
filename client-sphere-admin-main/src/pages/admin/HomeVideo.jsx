import { useEffect, useState } from "react";
import { toast } from "sonner";
import { homeVideoService } from "@/services/homeVideoService";

export default function AdminHomeVideo() {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await homeVideoService.getAdmin();
    setVideos(res.data.videos || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select demo video");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      await homeVideoService.create(formData);
      toast.success("Home demo video added");
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add demo video");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    await homeVideoService.delete(id);
    toast.success("Video deleted");
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Home Demo Video</h1>

      <form onSubmit={submit} className="bg-white rounded-xl shadow p-5 space-y-4">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border rounded p-2"
        />

        <button
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Add Home Video"}
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {videos.map((v) => (
          <div key={v.id} className="bg-white rounded-xl shadow overflow-hidden">
            <video src={v.video_url} controls className="h-56 w-full object-cover" />

            <div className="p-3 flex justify-between items-center">
              <span className="text-sm">
                {v.status}
              </span>

              <button
                onClick={() => remove(v.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}