# Simple Image Compressor

[![Astro](https://img.shields.io/badge/Astro-FF5A1F?style=for-the-badge&logo=astro)](https://astro.build/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![daisyUI](https://img.shields.io/badge/daisyUI-56B3FA?style=for-the-badge&logo=daisyui&logoColor=white)](https://daisyui.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A lightweight **Image Compressor** web application built with **Astro**. This app allows users to upload images, set a target file size, and download a compressed version, all with a seamless and intuitive interface.

Check out the live demo of the app at [Simple Image Compressor](https://simple-image-compress.vercel.app/).

---

## Features

- **Image Upload**: Upload images directly from your device.
- **Compression Control**: Set a desired file size for the image compression.
- **Live Preview**: View both the original and compressed images side by side.
- **One-Click Download**: Download the compressed image in a single click.

---

## Technologies Used

- **Astro**: Modern static site generator for fast, optimized websites.
- **Tailwind CSS**: Utility-first CSS framework for fast and responsive styling.
- **DaisyUI**: Tailwind CSS plugin offering ready-made UI components for faster development.
- **TypeScript**: Superset of JavaScript adding static typing for better code quality and maintainability.
- **Vercel**: Platform for deploying static sites with automatic scaling and fast performance.

---

## Compress Image Function

The core of the app is the `compressImage` function. You can view the code for this function in the [utils.ts file on GitHub](https://github.com/mmmmaharshi/image-compressor/blob/bb517c50cfe558afac69991417f787d1ed5eaacf/src/lib/utils.ts#L9).

Here's the full function code for reference:

```typescript
// utils.ts
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
```
