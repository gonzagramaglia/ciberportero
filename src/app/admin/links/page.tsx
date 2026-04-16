import { db } from "@/lib/db";
import { Plus, ExternalLink, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";

export default async function AdminLinksPage() {
  const [links, note] = await Promise.all([
    db.link.findMany({ orderBy: { order: 'asc' } }),
    getAdminNote('links')
  ]);

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Administrar Links</h2>
          <p className="admin-subtitle">
            Gestiona los enlaces directos de la página de inicio{" "}
            <Link href="/links" target="_blank" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
              /links
            </Link>.
          </p>
        </div>
        <Link href="/admin/links/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          <span>Nuevo Link</span>
        </Link>
      </div>

      <div className="admin-card table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre (ES)</th>
              <th>URL</th>
              <th>Icono</th>
              <th style={{ textAlign: 'center' }}>Orden</th>
              <th style={{ textAlign: 'right', paddingRight: '2.5rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {links.length > 0 ? links.map((link) => {
              // Defensive parsing for name and description
              const nameObj = typeof link.name === 'string' ? { es: link.name } : (link.name as any);
              const name = nameObj?.es || nameObj?.en || nameObj?.pt || 'Sin nombre';
              
              const url = link.url || '#';
              const displayUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;

              return (
                <tr key={link.id}>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{name}</td>
                  <td>
                    <a href={url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                      {displayUrl} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{link.iconType || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="admin-flex-center" style={{ justifyContent: 'center', gap: '0.8rem' }}>
                      <span style={{ fontWeight: 800, color: '#64748b', fontSize: '1.2rem', minWidth: '1.5rem' }}>{link.order}</span>
                      <ReorderButtons id={link.id} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', paddingRight: '1rem' }}>
                      <Link 
                        href={`/admin/links/${link.id}`} 
                        style={{ 
                          color: '#94a3b8', 
                          width: '36px', height: '36px',
                          borderRadius: '50%',
                          background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                          border: '1px solid #e2e8f0'
                        }}
                        className="admin-edit-btn"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Link>
                      <DeleteButton id={link.id} type="link" />
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  No hay links configurados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
