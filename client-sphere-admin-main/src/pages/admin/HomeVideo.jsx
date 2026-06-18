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
import { homeVideoService } from "@/services/homeVideoService";

export default function AdminHomeVideo() {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const fileInputRef = useRef(null);

  const load = async () => {
    const res = await homeVideoService.getAdmin();
    setVideos(res.data.videos || []);
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
      toast.error("Please select demo video");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      await homeVideoService.create(formData);
      toast.success("Home demo video added");
      resetFileInput();
      setOpen(false);
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
    <div className="space-y-6 px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Upload and manage demo videos shown on the homepage.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700"
        >
          <FaPlus />
          Add Home Video
        </button>
      </div>

      {videos.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          No home videos yet. Click Add Home Video to upload one.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <div
              key={v.id}
              className="overflow-hidden rounded-xl bg-card shadow transition hover:shadow-lg"
            >
              <video
                src={v.video_url}
                controls
                className="h-56 w-full object-cover"
              />

              <div className="flex items-center justify-between p-3">
                <span className="text-sm capitalize text-muted-foreground">
                  {v.status}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(v.id)}
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
            <DialogTitle>Add home video</DialogTitle>
            <DialogDescription>
              Choose a video file to display on the homepage.
            </DialogDescription>
          </DialogHeader>

          <form key={formKey} onSubmit={submit} className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border bg-background p-2 text-sm"
            />

            {file ? (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No video selected
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
                {loading ? "Uploading..." : "Add Home Video"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
