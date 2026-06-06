import { useEffect, useState } from "react";
import { toast } from "sonner";
import { bannerService } from "@/services/bannerService";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await bannerService.getAdmin();
    setBanners(res.data.banners || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select banner image");
      return;
    }

    const formData = new FormData();
    formData.append("banner", file);

    setLoading(true);
    try {
      await bannerService.create(formData);
      toast.success("Banner added");
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add banner");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    await bannerService.delete(id);
    toast.success("Banner deleted");
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Home Banners</h1>

      <form onSubmit={submit} className="bg-white rounded-xl shadow p-5 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border rounded p-2"
        />

        <button
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Add Banner"}
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow overflow-hidden">
            <img src={b.image_url} className="h-48 w-full object-cover" />
            <div className="p-3 flex justify-end">
              <button
                onClick={() => remove(b.id)}
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