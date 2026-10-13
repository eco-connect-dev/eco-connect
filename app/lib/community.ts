import { supabase } from "@/lib/supabase";

export type CommunityPost = {
  id: string;
  author_id: string;
  author_name: string;
  description: string;
  location: string;
  image_url: string;
  created_at: string;
};

export async function getCommunityPosts() {
  const { data, error } = await supabase
    .from("community_posts")
    .select(
      "id, author_id, author_name, description, location, image_url, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CommunityPost[];
}

export async function createCommunityPost({
  authorId,
  authorName,
  description,
  location,
  imageUrl,
}: {
  authorId: string;
  authorName: string;
  description: string;
  location: string;
  imageUrl: string;
}) {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_id: authorId,
      author_name: authorName.trim(),
      description: description.trim(),
      location: location.trim(),
      image_url: imageUrl.trim(),
    })
    .select(
      "id, author_id, author_name, description, location, image_url, created_at",
    )
    .single();

  if (error) throw error;
  return data as CommunityPost;
}

export function getPostTimeLabel(createdAt: string) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  );
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays}d ago`;
  return new Date(createdAt).toLocaleDateString();
}
