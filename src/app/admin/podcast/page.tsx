import { db } from "@/lib/db";
import { Plus, Speaker, CheckCircle2, Edit, Smile } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SuccessToast from "@/components/admin/SuccessToast";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminPodcastPage() {
  const podcasts = await db.podcast.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <div className="admin-header">
        <div>
          <div style={{ marginBottom: '0.25rem' }}>
            <h2 className="admin-title">Podcast / Audios</h2>
          </div>
          <p className="admin-subtitle">
            Gestión de archivos de audio y episodios. Ver{" "}
            <Link href="/podcast" target="_blank" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
              Podcast
            </Link>.
          </p>
        </div>
        <Link href="/admin/podcast/new" className="btn-primary" style={{ textDecoration: 'none', boxShadow: '0 4px 12px rgba(0, 112, 243, 0.2)' }}>
          <Plus size={18} />
          <span>Nuevo Audio</span>
        </Link>
      </div>

      <div className="admin-card table-container" style={{ borderRadius: '20px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Audio</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {podcasts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No hay podcasts creados aún.
                </td>
              </tr>
            ) : (
              podcasts.map((podcast) => {
                const titleObj = podcast.title as any;
                const hasEs = !!titleObj?.es;
                const hasEn = !!titleObj?.en;
                const hasPt = !!titleObj?.pt;

                return (
                  <tr key={podcast.id}>
                    <td style={{ verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div className="admin-flex-center">
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '8px', 
                            background: '#f8fafc', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0',
                            flexShrink: 0
                          }}>
                            <Speaker size={16} />
                          </div>
                          <Link 
                            href={`/podcast/${podcast.slug}`} 
                            target="_blank" 
                            style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'none', lineHeight: 1.2 }}
                          >
                            {titleObj?.es || podcast.slug}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <div style={{ marginTop: '0.5rem' }}>
                        {podcast.published ? (
                          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Publicado
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#92400e', borderRadius: '8px' }}>Borrador</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, verticalAlign: 'top', paddingTop: '1.25rem' }}>
                      {new Date(podcast.date || podcast.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link 
                          href={`/admin/podcast/${podcast.id}`} 
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '50%', background: 'white', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#94a3b8', border: '1px solid #e2e8f0', transition: 'all 0.2s'
                          }}
                        >
                          <Edit size={16} />
                        </Link>
                        <DeleteButton id={podcast.id} type="podcast" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <a 
        href="https://emojis.hoy.today" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          position: 'fixed', bottom: '4rem', right: '4.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          color: '#0f172a', zIndex: 9999, border: '2px solid #e2e8f0'
        }}
      >
        <Smile size={32} />
      </a>
    </div>
  );
}
