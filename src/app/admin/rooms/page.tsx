import { getAllRooms } from "@/lib/roomsActions";
import AdminRoomsList from "@/components/admin/AdminRoomsList";
import { Hash } from "lucide-react";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";

export default async function AdminRoomsPage() {
    const [rooms, note] = await Promise.all([
        getAllRooms(),
        getAdminNote('rooms')
    ]);

    return (
        <div className="space-y-12">
            <div className="admin-header">
                <div>
                    <h2 className="admin-title">Administración de Salas</h2>
                    <p className="admin-subtitle">Gestiona todas las salas, miembros y contenido generado.</p>
                </div>
            </div>

            <AdminRoomsList initialRooms={rooms} />

            <AdminSectionNotes section="rooms" initialContent={note?.content || ''} />
        </div>
    );
}
