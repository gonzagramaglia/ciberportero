import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ciberportero | Links',
    description: 'Recursos y Enlaces Útiles para estudiantes de la Lic. en Ciberdefensa de la UNDEF',
};

export default function LinksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
