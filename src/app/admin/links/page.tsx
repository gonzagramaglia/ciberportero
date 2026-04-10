import { db } from "@/lib/db";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default async function AdminLinksPage() {
  const links = await db.link.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Administrar Links</h2>
          <p className="text-slate-500 mt-2">Gestiona los enlaces directos de la página de inicio /links.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus size={18} />
          <span>Nuevo Link</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">URL</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Icono</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Orden</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {links.length > 0 ? links.map((link) => (
              <tr key={link.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-900">{(link.name as any)?.es || 'Sin nombre'}</td>
                <td className="p-4 text-slate-500 text-sm max-w-xs truncate">
                  <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                    {link.url} <ExternalLink size={12} />
                  </a>
                </td>
                <td className="p-4 text-slate-500 text-sm capitalize">{link.iconType || '-'}</td>
                <td className="p-4 text-slate-500 text-sm">{link.order}</td>
                <td className="p-4 text-right">
                  <button className="text-slate-400 hover:text-rose-600 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 italic">
                  No hay links configurados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
        <strong>Nota:</strong> Esta interfaz es una estructura inicial. Para que funcione la edición/creación, necesitarás implementar los Server Actions correspondientes.
      </div>
    </div>
  );
}
