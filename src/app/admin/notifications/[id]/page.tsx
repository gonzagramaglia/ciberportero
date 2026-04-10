import { db } from "@/lib/db";
import NotificationEditor from "@/components/admin/NotificationEditor";
import { notFound } from "next/navigation";

export default async function EditNotificationPage({ params }: { params: { id: string } }) {
  const notification = await db.notification.findUnique({
    where: { id: params.id }
  });

  if (!notification) notFound();

  return <NotificationEditor notification={notification} />;
}
