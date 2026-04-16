import { db } from "@/lib/db";
import CountdownsList from "@/components/admin/CountdownsList";

export default async function AdminCountdownsPage() {
  const countdowns = await db.countdown.findMany({ 
    where: { 
      postId: null 
    },
    orderBy: { 
      slot: 'asc' 
    } 
  });

  return <CountdownsList countdowns={countdowns} />;
}
