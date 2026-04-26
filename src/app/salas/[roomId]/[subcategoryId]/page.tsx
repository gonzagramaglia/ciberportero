import { getSubcategoryMessages } from "@/lib/salasActions";
import RoomChatClient from "@/components/RoomChatClient";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function SubcategoryPage({ params }: any) {
  const { subcategoryId } = await params;
  const session = await auth();
  
  const isGuest = subcategoryId.startsWith('guest-') || subcategoryId.startsWith('sub-');
  let subcategory;
  let initialMessages: any[] = [];

  if (isGuest) {
    subcategory = { id: subcategoryId, name: '...', category: { name: '...' } };
    initialMessages = []; // Will be loaded by client from localStorage
  } else {
    if (!session) redirect('/salas');
    subcategory = await db.roomSubcategory.findUnique({
      where: { id: subcategoryId },
      include: { category: true }
    });
    if (!subcategory) notFound();
    initialMessages = await getSubcategoryMessages(subcategoryId);
  }

  return (
    <RoomChatClient 
      subcategoryId={subcategoryId} 
      initialMessages={initialMessages} 
      session={session} 
    />
  );
}
