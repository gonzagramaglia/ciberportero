import { db } from "@/lib/db";
import CountdownsList from "@/components/admin/CountdownsList";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";

export default async function AdminCountdownsPage() {
  const [countdowns, note] = await Promise.all([
    db.countdown.findMany({ 
      where: { postId: null },
      orderBy: { slot: 'asc' } 
    }),
    getAdminNote('countdowns')
  ]);

  return (
    <>
      <CountdownsList countdowns={countdowns} />
      <AdminSectionNotes section="countdowns" initialContent={note?.content || ''} />
    </>
  );
}
