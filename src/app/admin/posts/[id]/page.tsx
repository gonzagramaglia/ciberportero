import { db } from "@/lib/db";
import PostEditor from "@/components/admin/PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({
    where: { id: params.id }
  });

  if (!post) notFound();

  return <PostEditor post={post} />;
}
