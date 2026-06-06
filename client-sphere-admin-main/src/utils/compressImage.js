/** Resize image file to JPEG data URL for DB storage (max width 400). */
export function compressImageFile(file, maxWidth = 400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}
