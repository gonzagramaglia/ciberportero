import { db } from "@/lib/db";
import PodcastEditor from "@/components/admin/PodcastEditor";
import { notFound } from "next/navigation";

export default async function EditPodcastPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const podcast = await db.podcast.findUnique({
    where: { id }
  });

  if (!podcast) return notFound();

  return <PodcastEditor podcast={podcast} />;
}
