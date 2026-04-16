import ImageManager from "@/components/admin/ImageManager";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";

export const metadata = {
  title: "Admin | Imágenes",
};

export default async function AdminImagesPage() {
  const note = await getAdminNote('images');

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">
            Gestión de Imágenes
          </h2>
          <p className="admin-subtitle">Sube imágenes para usar en tus posts con slugs personalizados.</p>
        </div>
      </div>

      <ImageManager />

      <AdminSectionNotes section="images" initialContent={note?.content || ''} />
    </div>
  );
}
