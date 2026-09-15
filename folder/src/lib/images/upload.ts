import { SupabaseClient } from "@supabase/supabase-js";

const defaultMaxDimension = 1800;
const defaultQuality = 0.82;
const uploadTimeoutMs = 45000;

export async function optimizeImageForUpload(file: File, maxDimension = defaultMaxDimension, quality = defaultQuality) {
  if (!file.type.startsWith("image/")) return file;
  const image = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;
  return new File([blob], replaceExtension(file.name, "jpg"), { type: "image/jpeg" });
}

export async function uploadImageToBucket(supabase: SupabaseClient, bucket: string, path: string, file: File) {
  const uploadPromise = supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  const { error } = await withTimeout(uploadPromise, uploadTimeoutMs);
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read selected image."));
    };
    image.src = url;
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error("Image upload is taking too long. Please try a smaller image or check your connection.")), timeoutMs)),
  ]);
}

function replaceExtension(name: string, extension: string) {
  return name.replace(/\.[^.]+$/, "") + `.${extension}`;
}
