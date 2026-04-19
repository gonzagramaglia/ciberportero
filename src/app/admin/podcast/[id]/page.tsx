import { db } from "@/lib/db";
import PodcastEditor from "@/components/admin/PodcastEditor";
import { notFound } from "next/navigation";

export default async function EditPodcastPage({ params }: { params: { id: string } }) {
  const podcast = await db.podcast.findUnique({
    where: { id: params.id }
  });

  if (!podcast) return notFound();

  return <PodcastEditor podcast={podcast} />;
}
