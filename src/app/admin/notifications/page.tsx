import { db } from "@/lib/db";
import NotificationsList from "@/components/admin/NotificationsList";

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({ 
    orderBy: { createdAt: 'desc' } 
  });

  return <NotificationsList notifications={notifications} />;
}
