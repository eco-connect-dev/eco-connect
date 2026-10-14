import type { ImagePickerAsset } from "expo-image-picker";

import { supabase } from "@/lib/supabase";

export type ImageBucket =
  | "community_posts"
  | "dump-report-images"
  | "pickup_requests";

function decodeBase64(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

export async function uploadImage(
  bucket: ImageBucket,
  userId: string,
  asset: ImagePickerAsset,
): Promise<string> {
  if (!asset.base64) throw new Error("The selected image could not be read. Please choose it again.");

  const contentType = asset.mimeType || "image/jpeg";
  const extension = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, decodeBase64(asset.base64), {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
}
