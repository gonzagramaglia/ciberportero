import { db } from "@/lib/db";
import NotificationsList from "@/components/admin/NotificationsList";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";

export default async function AdminNotificationsPage() {
  const [notifications, note] = await Promise.all([
    db.notification.findMany({ 
      orderBy: { createdAt: 'desc' } 
    }),
    getAdminNote('notifications')
  ]);

  return (
    <>
      <NotificationsList notifications={notifications} />
      <AdminSectionNotes section="notifications" initialContent={note?.content || ''} />
    </>
  );
}
