import ImageManager from "@/components/admin/ImageManager";
import SuccessToast from "@/components/admin/SuccessToast";
import { Suspense } from "react";

export const metadata = {
  title: "Editor | Imágenes",
};

export default function EditorImagesPage() {
  return (
    <div className="space-y-6 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">
            Tus Imágenes
          </h2>
          <p className="admin-subtitle">Sube imágenes para usar en tus posts con slugs personalizados.</p>
        </div>
      </div>

      <ImageManager filterByUploader={true} source="editor" />
    </div>
  );
}
