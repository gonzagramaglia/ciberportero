import Link from 'next/link';
import { ShieldAlert, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <div className="not-found-icon">
                <ShieldAlert size={80} strokeWidth={1.5} />
            </div>

            <h1 className="not-found-code">404</h1>

            <h2 className="not-found-title">Página no encontrada</h2>

            <p className="not-found-desc">
                Parece que te has perdido en la red. El recurso que buscas no está disponible o ha sido movido.
            </p>

            <Link href="/" className="not-found-button">
                <Home size={20} />
                Volver al inicio
            </Link>
        </div>
    );
}
