import { db } from "@/lib/db";
import CountdownsList from "@/components/admin/CountdownsList";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import SuccessToast from "@/components/admin/SuccessToast";
import { Suspense } from "react";

export default async function AdminCountdownsPage() {
  const [countdowns, note] = await Promise.all([
    db.countdown.findMany({ 
      where: { postId: null },
      orderBy: { slot: 'asc' } 
    }),
    getAdminNote('countdowns')
  ]);

  return (
    <div className="space-y-6 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <CountdownsList countdowns={countdowns} />
      <AdminSectionNotes section="countdowns" initialContent={note?.content || ''} />
    </div>
  );
}
