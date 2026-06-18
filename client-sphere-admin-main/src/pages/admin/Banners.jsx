import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { bannerService } from "@/services/bannerService";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const fileInputRef = useRef(null);

  const load = async () => {
    const res = await bannerService.getAdmin();
    setBanners(res.data.banners || []);
  };

  useEffect(() => {
    load();
  }, []);

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormKey((k) => k + 1);
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetFileInput();
    }
  };

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
      resetFileInput();
      setOpen(false);
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
    <div className="space-y-6 px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Upload and manage homepage banner images shown to learners.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700"
        >
          <FaPlus />
          Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          No banners yet. Click Add Banner to upload one.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="overflow-hidden rounded-xl bg-card shadow transition hover:shadow-lg"
            >
              <img
                src={b.image_url}
                className="h-48 w-full object-cover"
                alt=""
              />
              <div className="flex justify-end p-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(b.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add banner</DialogTitle>
            <DialogDescription>
              Choose an image to display on the homepage carousel.
            </DialogDescription>
          </DialogHeader>

          <form key={formKey} onSubmit={submit} className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border bg-background p-2 text-sm"
            />

            {file ? (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No banner image selected
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Add Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
