import { db } from "@/lib/db";
import { Plus, ExternalLink, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";

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
        <Link href="/admin/links/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          <span>Nuevo Link</span>
        </Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre (ES)</th>
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
                  <a href={link.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {link.url} <ExternalLink size={12} />
                  </a>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{link.iconType || '-'}</td>
                <td>{link.order}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
                    <Link href={`/admin/links/${link.id}`} style={{ color: '#94a3b8', padding: '0.5rem' }}>
                      <Edit size={18} />
                    </Link>
                    <DeleteButton id={link.id} type="link" />
                  </div>
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
