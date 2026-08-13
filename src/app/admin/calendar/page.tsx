import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import SuccessToast from "@/components/admin/SuccessToast";
import AdminCalendarList from "@/components/admin/AdminCalendarList";
import { Suspense } from "react";

export default async function AdminCalendarPage() {
  const [events, note] = await Promise.all([
    db.calendarEvent.findMany({ orderBy: { startDate: 'desc' } as any }),
    getAdminNote('calendar')
  ]);

  return (
    <div className="space-y-12 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Calendario Académico</h2>
          <p className="admin-subtitle">
            Gestiona fechas de exámenes, inscripciones y eventos. Ver{" "}
            <Link href="/calendar" target="_blank" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
              /calendar
            </Link>.
          </p>
        </div>
        <Link href="/admin/calendar/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          <span>Nuevo Evento</span>
        </Link>
      </div>

      <AdminCalendarList events={events} />

      <AdminSectionNotes section="calendar" initialContent={note?.content || ''} />
    </div>
  );
}
