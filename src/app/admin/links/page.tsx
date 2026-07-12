import { db } from "@/lib/db";
import { Plus, ExternalLink, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import SuccessToast from "@/components/admin/SuccessToast";
import { Suspense } from "react";

export default async function AdminLinksPage() {
  const [links, note] = await Promise.all([
    db.link.findMany({ orderBy: { order: 'asc' } }),
    getAdminNote('links')
  ]);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
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
              <th>Link</th>
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
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {link.iconType && (link.iconType.startsWith('/') || link.iconType.startsWith('http')) ? (
                        <img src={link.iconType} alt={name} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : link.iconType ? (
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                          {link.iconType.substring(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ExternalLink size={16} color="#64748b" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        <a href={url} target="_blank" rel="noreferrer" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {displayUrl} <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </td>
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
                <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  No hay links configurados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminSectionNotes section="links" initialContent={note?.content || ''} />
    </div>
  );
}
