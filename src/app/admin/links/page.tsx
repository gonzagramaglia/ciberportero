import { db } from "@/lib/db";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default async function AdminLinksPage() {
  const links = await db.link.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Administrar Links</h2>
          <p className="admin-subtitle">Gestiona los enlaces directos de la página de inicio /links.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Nuevo Link</span>
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>URL</th>
              <th>Icono</th>
              <th>Orden</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {links.length > 0 ? links.map((link) => (
              <tr key={link.id}>
                <td style={{ fontWeight: 600 }}>{(link.name as any)?.es || 'Sin nombre'}</td>
                <td>
                  <a href={link.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    {link.url}
                  </a>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{link.iconType || '-'}</td>
                <td>{link.order}</td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
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
