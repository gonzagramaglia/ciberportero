import { db } from "@/lib/db";
import { Plus, Search, FileText, Globe, Trash2, Edit } from "lucide-react";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({ orderBy: { date: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Posts y Notas</h2>
          <p className="text-slate-500 mt-2">Administra el contenido del portal por idioma.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus size={18} />
          <span>Nuevo Post</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Idioma</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400" />
                    <span className="font-medium text-slate-900">{post.title}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    <Globe size={14} />
                    {post.lang}
                  </div>
                </td>
                <td className="p-4">
                  {post.published ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">Publicado</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">Borrador</span>
                  )}
                </td>
                <td className="p-4 text-slate-500 text-sm">{new Date(post.date).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="text-slate-400 hover:text-blue-600 p-2 transition-colors"><Edit size={18} /></button>
                    <button className="text-slate-400 hover:text-rose-600 p-2 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 italic">No hay posts en la base de datos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
