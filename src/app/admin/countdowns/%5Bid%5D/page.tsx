import { db } from "@/lib/db";
import CountdownEditor from "@/components/admin/CountdownEditor";
import { notFound } from "next/navigation";

export default async function EditCountdownPage({ params }: { params: { id: string } }) {
  const countdown = await db.countdown.findUnique({
    where: { id: params.id }
  });

  if (!countdown) notFound();

  return <CountdownEditor countdown={countdown} />;
}
