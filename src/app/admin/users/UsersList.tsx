'use client';

import { useState } from "react";
import { Mail, Shield, Calendar, MessageSquare, Link as LinkIcon, Search, User as UserIcon, CheckCircle } from "lucide-react";

interface UsersListProps {
  initialUsers: any[];
}

export default function UsersList({ initialUsers }: UsersListProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = initialUsers.filter(user => 
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Generate a consistent color based on the name
  const getBgColor = (name: string) => {
    const colors = ['#eff6ff', '#fff7ed', '#f5f3ff', '#f0fdf4', '#fdf2f8', '#f0f9ff'];
    const textColors = ['#3b82f6', '#f97316', '#8b5cf6', '#22c55e', '#ec4899', '#0ea5e9'];
    const index = name ? name.length % colors.length : 0;
    return { bg: colors[index], text: textColors[index] };
  };

  return (
    <div className="space-y-6">
      <div className="admin-card" style={{ padding: '1.5rem 2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Search size={20} style={{ color: '#94a3b8' }} />
        <input 
          type="text"
          placeholder="Buscar por nombre o email..."
          className="admin-input"
          style={{ border: 'none', padding: 0, fontSize: '1.1rem', background: 'transparent' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="admin-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '32px' }}>
        <div style={{ padding: '2.5rem 3rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
            Usuarios Registrados ({filteredUsers.length})
          </h3>
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
            <tbody>
              {filteredUsers.map((user) => {
                const colors = getBgColor(user.name || user.email || '');
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '2rem 3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ 
                          width: '48px', height: '48px', borderRadius: '50%', 
                          background: colors.bg, color: colors.text,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.2rem', fontWeight: 900, flexShrink: 0
                        }}>
                          {getInitial(user.name || user.email || "")}
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
                            {user._count?.comments || 0}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }} title="Links Personales">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 800 }}>
                            <LinkIcon size={14} className="text-accent" />
                            {user._count?.links || 0}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }} title="Eventos de Calendario">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 800 }}>
                            <Calendar size={14} style={{ color: '#8b5cf6' }} />
                            {user._count?.calendarEvents || 0}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }} title="Progreso del Plan">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 800 }}>
                            {(() => {
                              const completedCount = user.examProgress?.filter((p: any) => p.completed).length || 0;
                              const hasInProgress = user.examProgress?.some((p: any) => !p.completed);
                              return (
                                <>
                                  <CheckCircle size={14} style={{ color: hasInProgress ? '#eab308' : 'var(--success)' }} />
                                  {Math.round((completedCount / 37) * 100)}%
                                </>
                              );
                            })()}
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
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
              No se encontraron usuarios que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
