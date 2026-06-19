import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Upload,
  FileText,
  FileVideo,
  FileSpreadsheet,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Filter,
  FolderOpen,
  HardDrive,
  Loader2,
  GraduationCap,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  MATERIAL_CLASS_OPTIONS,
} from "@/lib/catalog";
import SubjectSelect from "@/components/admin/SubjectSelect";
import { courseService } from "@/services/courseService";
import { materialService } from "@/services/materialService";
import { uploadService } from "@/services/uploadService";
import { formatFileSize, normalizeMaterialType, timeAgo } from "@/utils/formatMaterial";
import { toast } from "sonner";

const typeMeta = {
  PDF: { icon: FileText, tint: "bg-rose-500/10 text-rose-600", ring: "ring-rose-500/20" },
  Doc: { icon: FileSpreadsheet, tint: "bg-sky-500/10 text-sky-600", ring: "ring-sky-500/20" },
  Video: { icon: FileVideo, tint: "bg-violet-500/10 text-violet-600", ring: "ring-violet-500/20" },
};

const TYPE_TO_BACKEND = {
  PDF: "PDF",
  Doc: "DOC",
  Video: "Video",
};

const ALLOWED_TYPES = ["PDF", "Doc", "Video"];

export default function MaterialsPage() {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [materialsRes, coursesRes] = await Promise.all([
        materialService.getAll(),
        courseService.getAll(),
      ]);
      setItems(materialsRes.data.materials || []);
      setCourses(coursesRes.data.courses || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load materials");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const publishedCourses = useMemo(
    () => courses.filter((c) => c.status === "Active"),
    [courses]
  );

  const publishedCourseIds = useMemo(
    () => new Set(publishedCourses.map((c) => String(c.id))),
    [publishedCourses]
  );

  const publishedItems = useMemo(
    () =>
      items.filter(
        (m) =>
          publishedCourseIds.has(String(m.courseId)) &&
          ALLOWED_TYPES.includes(normalizeMaterialType(m.type))
      ),
    [items, publishedCourseIds]
  );

  const classOptions = useMemo(() => {
    const set = new Set(
      publishedItems.map((m) => m.classLevel || m.category).filter(Boolean)
    );
    return [...set].sort();
  }, [publishedItems]);

  const subjectOptions = useMemo(() => {
    const set = new Set(
      publishedItems
        .filter((m) => {
          if (classFilter === "all") return true;
          return (m.classLevel || m.category) === classFilter;
        })
        .map((m) => m.subject || m.subCategory)
        .filter(Boolean)
    );
    return [...set].sort();
  }, [publishedItems, classFilter]);

  const topicOptions = useMemo(() => {
    return publishedCourses.filter((c) => {
      const courseClass = c.classLevel || c.category || "";
      const courseSubject = c.subject || c.subCategory || "";
      if (classFilter !== "all" && courseClass !== classFilter) return false;
      if (subjectFilter !== "all" && courseSubject !== subjectFilter) return false;
      return true;
    });
  }, [publishedCourses, classFilter, subjectFilter]);

  const filtered = useMemo(() => {
    return publishedItems.filter((m) => {
      const displayType = normalizeMaterialType(m.type);
      const matchQuery =
        !query ||
        m.title?.toLowerCase().includes(query.toLowerCase()) ||
        m.course?.toLowerCase().includes(query.toLowerCase());

      const matchTab = tab === "all" || displayType === tab;
      const matchCourse =
        courseFilter === "all" || String(m.courseId) === courseFilter;
      const matchClass =
        classFilter === "all" ||
        (m.classLevel || m.category) === classFilter;
      const matchSubject =
        subjectFilter === "all" ||
        (m.subject || m.subCategory) === subjectFilter;

      return matchQuery && matchTab && matchCourse && matchClass && matchSubject;
    });
  }, [publishedItems, query, tab, courseFilter, classFilter, subjectFilter]);

  const stats = useMemo(() => {
    return {
      total: publishedItems.length,
      videos: publishedItems.filter((m) => normalizeMaterialType(m.type) === "Video").length,
      docs: publishedItems.filter((m) =>
        ["PDF", "Doc"].includes(normalizeMaterialType(m.type))
      ).length,
    };
  }, [publishedItems]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await materialService.delete(item.sourceType, item.dbId);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Material deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Resources from published classes appear here. Draft class uploads stay hidden until you publish.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              const csv = publishedItems
                .map((i) => `${i.title},${normalizeMaterialType(i.type)},${i.course}`)
                .join("\n");
              const blob = new Blob([`Title,Type,Class\n${csv}`]);
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "materials.csv";
              a.click();
            }}
          >
            Export
          </Button>

          <UploadMaterialDialog
            open={open}
            onOpenChange={setOpen}
            courses={publishedCourses}
            onSuccess={loadData}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total materials" value={stats.total} icon={FolderOpen} bg="bg-purple-100" color="text-purple-600" />
        <StatCard label="Videos" value={stats.videos} icon={FileVideo} bg="bg-blue-100" color="text-blue-600" />
        <StatCard label="Documents" value={stats.docs} icon={FileText} bg="bg-green-100" color="text-green-600" />
        <StatCard label="Classes linked" value={publishedCourses.length} icon={HardDrive} bg="bg-orange-100" color="text-orange-600" />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-gray-100 p-1 rounded-xl flex flex-wrap gap-1">
              {[
                { label: "All", value: "all" },
                { label: "PDFs", value: "PDF" },
                { label: "Docs", value: "Doc" },
                { label: "Videos", value: "Video" },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full lg:max-w-[700px]">
          {/* <div className="flex flex-col sm:flex-row gap-2 min-w-[280px] flex-wrap"> */}
            <Input 
              className="w-full"
              placeholder="Search by title or topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              value={classFilter}
              onValueChange={(v) => {
                setClassFilter(v);
                setSubjectFilter("all");
                setCourseFilter("all");
              }}
            >
              <SelectTrigger 
              // className="sm:w-[140px]"
              className="w-full"
              >
                <GraduationCap className="h-4 w-4 mr-1 shrink-0" />
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classOptions.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={subjectFilter}
              onValueChange={(v) => {
                setSubjectFilter(v);
                setCourseFilter("all");
              }}
            >
              <SelectTrigger 
              className="w-full"
              // className="sm:w-[140px]"
              >
                <Filter className="h-4 w-4 mr-1 shrink-0" />
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjectOptions.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger 
              className="w-full"
              // className="sm:w-[160px]"
              >
                <BookOpen className="h-4 w-4 mr-1 shrink-0" />
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {topicOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading materials...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No materials yet. Upload from here or add materials inside a class.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <MaterialCard key={m.id} item={m} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialCard({ item, onDelete }) {
  const displayType = normalizeMaterialType(item.type);
  const meta = typeMeta[displayType] || typeMeta.PDF;
  const Icon = meta.icon;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div className={`p-3 rounded-xl ring-1 ${meta.ring} ${meta.tint}`}>
            <Icon className="h-5 w-5" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  if (item.url) window.open(item.url, "_blank");
                  else toast.info("No file URL available");
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> Preview
              </DropdownMenuItem>
              {item.url && (
                <DropdownMenuItem
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = item.url;
                    a.target = "_blank";
                    a.download = item.title;
                    a.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="mt-3 font-medium break-words line-clamp-2">{item.title}</h3>
        <p className="text-xs text-gray-500 break-words line-clamp-1">{item.course}</p>
        {(item.classLevel || item.subject || item.category || item.subCategory) && (
          <p className="text-xs text-gray-400 mt-1">
            {[item.classLevel || item.category, item.subject || item.subCategory]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <div className="flex justify-between mt-3 text-xs">
          <Badge>{displayType}</Badge>
          <span>{timeAgo(item.uploadedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function UploadMaterialDialog({ open, onOpenChange, courses, onSuccess }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PDF");
  const [url, setUrl] = useState("");
  const [courseId, setCourseId] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [addToMatching, setAddToMatching] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const courseClass = c.classLevel || c.category || "";
      const courseSubject = c.subject || c.subCategory || c.sub_category || "";
      if (classLevel && courseClass !== classLevel) return false;
      if (subject && courseSubject !== subject) return false;
      return true;
    });
  }, [courses, classLevel, subject]);

  const resetForm = () => {
    setTitle("");
    setType("PDF");
    setUrl("");
    setCourseId("");
    setClassLevel("");
    setSubject("");
    setAddToMatching(false);
    setFile(null);
    const fileInput = document.getElementById("materialFileUpload");
    if (fileInput) fileInput.value = "";
  };

  const handleOpenChange = (next) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const uploadFile = async () => {
    if (!file) throw new Error("Please select a file to upload");

    const res =
      type === "Video"
        ? await uploadService.video(file)
        : await uploadService.material(file);

    return res.data.url;
  };

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!addToMatching && !courseId) {
      toast.error("Select a lesson or enable add to matching lessons");
      return;
    }
    if (!file && !url.trim()) {
      toast.error("Upload a file or paste a URL");
      return;
    }

    setUploading(true);
    try {
      let fileUrl = url.trim();
      if (file) {
        fileUrl = await uploadFile();
      }

      await materialService.create({
        title: title.trim(),
        type: TYPE_TO_BACKEND[type] || type,
        url: fileUrl,
        courseId: addToMatching ? undefined : Number(courseId),
        classLevel: classLevel || undefined,
        subject: subject || undefined,
        addToMatching,
      });

      toast.success(
        addToMatching
          ? "Added to all matching lessons"
          : "Material added to lesson"
      );
      handleOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const acceptMap = {
    PDF: ".pdf",
    Doc: ".doc,.docx,.xls,.xlsx,.zip",
    Video: "video/*",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-1" /> Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload material</DialogTitle>
          <DialogDescription>
            Upload PDF, Doc, or Video. Pick class, subject, and lesson — it will
            be saved and shown in this library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              placeholder="e.g. Week 3 Lecture Notes"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Doc">Doc</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Class</Label>
              <Select
                value={classLevel || "none"}
                onValueChange={(v) => {
                  setClassLevel(v === "none" ? "" : v);
                  setSubject("");
                  setCourseId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any class</SelectItem>
                  {MATERIAL_CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SubjectSelect
              label="Subject"
              value={subject}
              onChange={(v) => {
                setSubject(v);
                setCourseId("");
              }}
              classLevel={classLevel}
              required={false}
            />

            <div>
              <Label>Lesson</Label>
              <Select
                value={courseId || "none"}
                onValueChange={(v) => setCourseId(v === "none" ? "" : v)}
                disabled={addToMatching}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select lesson</SelectItem>
                  {filteredCourses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="addToMatching"
              checked={addToMatching}
              onCheckedChange={(v) => setAddToMatching(Boolean(v))}
            />
            <Label htmlFor="addToMatching" className="text-sm font-normal cursor-pointer">
              Add to all lessons with same class & subject
            </Label>
          </div>

          {(
            <>
              <div className="space-y-2">
                <Label>File URL (optional if uploading)</Label>
                <Input
                  value={url}
                  placeholder="https://..."
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => document.getElementById("materialFileUpload")?.click()}
              >
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="font-medium">Click to upload file</p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, Doc, Video — up to 200 MB
                </p>
                <input
                  id="materialFileUpload"
                  type="file"
                  accept={acceptMap[type]}
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                      setFile(selected);
                      if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
                    }
                  }}
                />
                {file && (
                  <div className="mt-3 flex items-center justify-between bg-gray-100 px-3 py-2 rounded text-left">
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-red-500 text-xs ml-2 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className="text-xl font-semibold">{value}</h2>
      </div>
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
