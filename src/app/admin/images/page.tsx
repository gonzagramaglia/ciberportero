import ImageManager from "@/components/admin/ImageManager";
import { ImageIcon } from "lucide-react";

export const metadata = {
  title: "Admin | Imágenes",
};

export default function AdminImagesPage() {
  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title flex items-center gap-3">
            <ImageIcon size={28} className="text-accent" />
            Gestión de Imágenes
          </h2>
          <p className="text-muted mt-1">Sube imágenes para usar en tus posts con slugs personalizados.</p>
        </div>
      </div>

      <ImageManager />
    </div>
  );
}
