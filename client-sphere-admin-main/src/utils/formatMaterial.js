export function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return "—";
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function timeAgo(date) {
  if (!date) return "Just now";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export function normalizeMaterialType(type) {
  const map = {
    PDF: "PDF",
    DOC: "Doc",
    DOCX: "Doc",
    PPT: "Slides",
    PPTX: "Slides",
    IMAGE: "Image",
    Image: "Image",
    ZIP: "Doc",
    LINK: "Link",
    Link: "Link",
    VIDEO: "Video",
    Video: "Video",
  };
  return map[type] || type || "PDF";
}
