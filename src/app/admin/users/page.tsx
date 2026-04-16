import { getUsers, getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import UsersList from "./UsersList";

export default async function UsersPage() {
  const users = await getUsers();
  const adminNote = await getAdminNote('users');

  return (
    <div className="space-y-12 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Gestión de Usuarios</h2>
          <p className="admin-subtitle">Administra los roles y visualiza la actividad de los usuarios registrados.</p>
        </div>
      </div>

      <UsersList initialUsers={users} />

      <AdminSectionNotes section="users" initialContent={adminNote?.content || ''} />
    </div>
  );
}
