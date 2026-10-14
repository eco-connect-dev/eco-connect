import { supabase } from "@/lib/supabase";

export type CommunityPost = {
  id: string;
  author_id: string;
  author_name: string;
  description: string | null;
  location: string;
  image_url: string | null;
  created_at: string;
};

export async function getCommunityPosts() {
  const { data, error } = await supabase
    .from("community_posts")
    .select(
      "id, author_id, author_name, description, location, image_url, created_at",
    )
    .eq("deleted", 0)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CommunityPost[];
}

export async function getCommunityPost(postId: string): Promise<CommunityPost> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, author_id, author_name, description, location, image_url, created_at")
    .eq("id", postId)
    .eq("deleted", 0)
    .single();

  if (error) throw error;
  return data as CommunityPost;
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
  description: string | null;
  location: string;
  imageUrl: string | null;
}) {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_id: authorId,
      author_name: authorName.trim(),
      description: description?.trim() || null,
      location: location.trim(),
      image_url: imageUrl?.trim() || null,
    })
    .select(
      "id, author_id, author_name, description, location, image_url, created_at",
    )
    .single();

  if (error) throw error;
  return data as CommunityPost;
}

export async function deleteCommunityPost(postId: string): Promise<void> {
  const { data, error } = await supabase
    .from("community_posts")
    .update({ deleted: 1 })
    .eq("id", postId)
    .eq("deleted", 0)
    .select("id, deleted")
    .maybeSingle();

  if (error) {
    throw new Error([error.code, error.message, error.details].filter(Boolean).join(" — "));
  }
  if (!data || data.deleted !== 1) {
    throw new Error("Supabase did not update this post. Check that migration 20261014000005 has been applied and that your account can update community_posts.deleted.");
  }
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
