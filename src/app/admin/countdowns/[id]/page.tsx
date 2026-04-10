import { db } from "@/lib/db";
import CountdownEditor from "@/components/admin/CountdownEditor";
import { notFound } from "next/navigation";

export default async function EditCountdownPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const countdown = await db.countdown.findUnique({
    where: { id }
  });

  if (!countdown) notFound();

  return <CountdownEditor countdown={countdown} />;
}
