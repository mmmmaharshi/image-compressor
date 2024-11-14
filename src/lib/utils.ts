export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function compressImage(
  file: File,
  targetSizeKB: number
): Promise<Blob> {
  const targetSizeBytes = targetSizeKB * 1024;
  let quality = 1.0;
  let compressedFile: File;

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  const blobToFile = async (blob: Blob): Promise<File> => {
    const buffer = await blob.arrayBuffer();
    return new File([buffer], file.name, { type: blob.type });
  };

  const compress = async (img: HTMLImageElement, q: number): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas context not available");

    let width = img.width;
    let height = img.height;
    const maxDimension = 1920;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob as Blob), "image/jpeg", q);
    });
  };

  const img = await createImage(URL.createObjectURL(file));

  let min = 0;
  let max = 1;
  let lastValid: Blob | null = null;

  while (min <= max) {
    quality = (min + max) / 2;
    const blob = await compress(img, quality);
    compressedFile = await blobToFile(blob);

    if (compressedFile.size > targetSizeBytes) {
      max = quality - 0.1;
    } else {
      lastValid = blob;
      min = quality + 0.1;
    }
  }

  return lastValid || (await compress(img, 0.1));
}
