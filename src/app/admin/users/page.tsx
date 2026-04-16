import { getUsers, updateAdminSectionNote, getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import { Users, Mail, Shield, Calendar, MessageSquare, Link as LinkIcon, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default async function UsersPage() {
  const users = await getUsers();
  const adminNote = await getAdminNote('users');

  return (
    <div className="space-y-12 fade-in">
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Users size={24} className="text-accent" />
            <h2 className="admin-title">Gestión de Usuarios</h2>
          </div>
          <p className="admin-subtitle">Administra los roles y visualiza la actividad de los usuarios registrados.</p>
        </div>
      </div>

      <section className="admin-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '32px' }}>
        <div style={{ padding: '2.5rem 3rem', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Usuarios Registrados ({users.length})</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1.25rem 3rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usuario</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rol</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actividad</th>
                <th style={{ padding: '1.25rem 3rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td style={{ padding: '2rem 3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', background: '#f1f5f9' }}>
                        {user.image ? (
                          <Image src={user.image} alt={user.name || ''} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <UserIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem' }}>{user.name || 'Sin nombre'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '2rem 2rem' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 1rem', borderRadius: '10px',
                      background: user.role === 'admin' ? '#f5f3ff' : '#f8fafc',
                      color: user.role === 'admin' ? '#7c3aed' : '#64748b',
                      fontWeight: 800, fontSize: '0.8rem'
                    }}>
                      <Shield size={14} />
                      {user.role.toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '2rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'center' }} title="Comentarios">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 800 }}>
                          <MessageSquare size={14} className="text-secondary" />
                          {user._count.comments}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }} title="Links Personales">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 800 }}>
                          <LinkIcon size={14} className="text-accent" />
                          {user._count.links}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }} title="Eventos de Calendario">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 800 }}>
                          <Calendar size={14} style={{ color: '#8b5cf6' }} />
                          {user._count.calendarEvents}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '2rem 3rem', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      {new Date(user.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {new Date(user.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminSectionNotes section="users" initialContent={adminNote?.content || ''} />
    </div>
  );
}
