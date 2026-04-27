import RoomChatClient from "@/components/RoomChatClient";
import { auth } from "@/auth";

export default async function RoomMainPage({ params }: any) {
  let roomId = "";
  try {
    const p = await params;
    roomId = p?.roomId || "";
  } catch (e) {}

  if (!roomId) return null;

  const session = await auth();
  const isGuest = roomId.startsWith('guest-') || roomId === 'test-room' || !session;

  return (
    <RoomChatClient 
      roomId={roomId}
      subcategoryId={null} 
      initialMessages={[]} 
      session={session} 
      isGuest={isGuest}
    />
  );
}
