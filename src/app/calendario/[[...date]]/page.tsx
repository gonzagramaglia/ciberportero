import { redirect } from 'next/navigation';

export default async function CalendarioRedirect({ 
    params 
}: { 
    params: Promise<{ date?: string[] }> 
}) {
    const { date } = await params;
    if (date && date.length > 0) {
        redirect(`/calendar/${date.join('/')}`);
    }
    redirect('/calendar');
}
