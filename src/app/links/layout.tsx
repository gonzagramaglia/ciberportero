import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Links',
    description: 'Para los estudiantes de la Licenciatura en Ciberdefensa de FADENA | UNDEF',
};

export default function LinksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
