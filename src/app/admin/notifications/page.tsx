import { db } from "@/lib/db";
import NotificationsList from "@/components/admin/NotificationsList";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import SuccessToast from "@/components/admin/SuccessToast";
import { Suspense } from "react";

export default async function AdminNotificationsPage() {
  const [notifications, note] = await Promise.all([
    db.notification.findMany({ 
      orderBy: { createdAt: 'desc' } 
    }),
    getAdminNote('notifications')
  ]);

  return (
    <div className="space-y-6 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <NotificationsList notifications={notifications} />
      <AdminSectionNotes section="notifications" initialContent={note?.content || ''} />
    </div>
  );
}
