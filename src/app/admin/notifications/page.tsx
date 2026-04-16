import { db } from "@/lib/db";
import NotificationsClient from "@/components/admin/NotificationsTabs";

export default async function AdminNotificationsPage() {
  const [notifications, countdowns] = await Promise.all([
    db.notification.findMany({ orderBy: { createdAt: 'desc' } }),
    db.countdown.findMany({ 
      where: { postId: null },
      orderBy: { slot: 'asc' } 
    })
  ]);

  return <NotificationsClient notifications={notifications} countdowns={countdowns} />;
}
