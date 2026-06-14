import { db } from "@/lib/db";
import PostEditor from "@/components/admin/PostEditor";
import { notFound } from "next/navigation";

export default async function EditEditorPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    include: { countdowns: true }
  });

  if (!post || !post.unlisted) {
    notFound();
  }

  return <PostEditor post={post} isEditorPortal={true} />;
}
