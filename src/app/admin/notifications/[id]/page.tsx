import { db } from "@/lib/db";
import NotificationEditor from "@/components/admin/NotificationEditor";
import { notFound } from "next/navigation";

export default async function EditNotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notification = await db.notification.findUnique({
    where: { id }
  });

  if (!notification) notFound();

  return <NotificationEditor notification={notification} />;
}
