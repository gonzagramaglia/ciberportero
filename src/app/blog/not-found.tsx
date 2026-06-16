import Link from 'next/link';
import { ShieldAlert, BookOpen } from 'lucide-react';

export default function BlogNotFound() {
    return (
        <div className="not-found-container">
            <div className="not-found-icon">
                <ShieldAlert size={80} strokeWidth={1.5} />
            </div>

            <h1 className="not-found-code">404</h1>

            <h2 className="not-found-title">Post no encontrado</h2>

            <p className="not-found-desc">
                Parece que te has perdido en la red. El post que buscas no está disponible o ha sido movido.
            </p>

            <Link href="/blog" className="not-found-button">
                <BookOpen size={20} />
                Volver al blog
            </Link>
        </div>
    );
}
